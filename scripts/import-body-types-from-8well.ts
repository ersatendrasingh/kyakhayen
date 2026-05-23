import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type SourcePrakriti = {
  id: number;
  name: string;
};

type SourceRecipeBodyFlags = {
  id: number;
  Vata: number | null;
  Pitta: number | null;
  Kapha: number | null;
};

type BodyTypeSeed = {
  sourceId: number;
  sourceName: "Vata" | "Pitta" | "Kapha";
  title: string;
  slug: string;
  imageFile: string;
  position: number;
};

type ImportAudit = {
  sourceRecipeCount: number;
  targetRecipeCount: number;
  totalLinks: number;
  multiTaggedRecipes: number;
  untaggedRecipes: number;
  linkCounts: Record<string, number>;
};

const SOURCE_SYSTEM = "8well";
const DEFAULT_SOURCE_DATABASE_NAME = "8well";
const DEFAULT_IMAGE_DIRECTORY = path.join(
  process.cwd(),
  "assets",
  "import",
  "body-types"
);
const shouldApply = process.argv.includes("--apply");

const BODY_TYPES: BodyTypeSeed[] = [
  {
    sourceId: 1,
    sourceName: "Vata",
    title: "Vata",
    slug: "vata",
    imageFile: "vata.webp",
    position: 1,
  },
  {
    sourceId: 2,
    sourceName: "Pitta",
    title: "Pitta",
    slug: "pitta",
    imageFile: "pitta.webp",
    position: 2,
  },
  {
    sourceId: 3,
    sourceName: "Kapha",
    title: "Kapha",
    slug: "kapha",
    imageFile: "kapha.webp",
    position: 3,
  },
];

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to import body types.`);
  }

  return value;
}

function getSourceDatabaseUrl() {
  if (process.env.SOURCE_8WELL_DATABASE_URL) {
    return process.env.SOURCE_8WELL_DATABASE_URL;
  }

  const sourceUrl = new URL(requireEnv("DATABASE_URL"));
  sourceUrl.pathname = `/${DEFAULT_SOURCE_DATABASE_NAME}`;
  return sourceUrl.toString();
}

function publicMediaUrl(key: string) {
  const baseUrl = requireEnv("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "");
  return `${baseUrl}/${key}`;
}

function enabledBodyTypes(row: SourceRecipeBodyFlags) {
  const values = [
    { seed: BODY_TYPES[0], value: row.Vata },
    { seed: BODY_TYPES[1], value: row.Pitta },
    { seed: BODY_TYPES[2], value: row.Kapha },
  ];

  for (const flag of values) {
    if (flag.value !== 0 && flag.value !== 1 && flag.value !== null) {
      throw new Error(
        `Unexpected ${flag.seed.sourceName} flag ${String(flag.value)} on source recipe ${row.id}.`
      );
    }
  }

  return values.filter((flag) => flag.value === 1).map((flag) => flag.seed);
}

async function validateSourceBodyTypes(sourceDb: PrismaClient) {
  const rows = await sourceDb.$queryRawUnsafe<SourcePrakriti[]>(
    "SELECT id, name FROM prakritis ORDER BY id"
  );

  if (rows.length !== BODY_TYPES.length) {
    throw new Error(`Expected 3 source prakritis but found ${rows.length}.`);
  }

  for (const seed of BODY_TYPES) {
    const source = rows.find((row) => row.id === seed.sourceId);

    if (!source || source.name.trim() !== seed.sourceName) {
      throw new Error(
        `Source Prakriti mismatch for id ${seed.sourceId}; expected ${seed.sourceName}.`
      );
    }
  }
}

async function assertImagesExist() {
  const imageDirectory =
    process.env.BODY_TYPE_IMAGE_SOURCE_DIR ?? DEFAULT_IMAGE_DIRECTORY;

  for (const bodyType of BODY_TYPES) {
    const imagePath = path.join(imageDirectory, bodyType.imageFile);
    await access(imagePath);
  }

  return imageDirectory;
}

async function buildImportRows(sourceDb: PrismaClient, targetDb: PrismaClient) {
  await validateSourceBodyTypes(sourceDb);

  const sourceRecipes = await sourceDb.$queryRawUnsafe<SourceRecipeBodyFlags[]>(
    "SELECT id, Vata, Pitta, Kapha FROM app_recipes ORDER BY id"
  );
  const targetRecipes = await targetDb.recipes.findMany({
    where: { sourceSystem: SOURCE_SYSTEM },
    select: { id: true, sourceId: true },
  });
  const targetIdBySourceId = new Map(
    targetRecipes.map((recipe) => [recipe.sourceId, recipe.id])
  );
  const missingTargetRecipeIds = sourceRecipes
    .filter((recipe) => !targetIdBySourceId.has(recipe.id))
    .map((recipe) => recipe.id);

  if (missingTargetRecipeIds.length > 0) {
    throw new Error(
      `Target recipes missing for 8well source ids: ${missingTargetRecipeIds.join(", ")}`
    );
  }

  if (sourceRecipes.length !== targetRecipes.length) {
    throw new Error(
      `Recipe identity mismatch: source=${sourceRecipes.length}, target=${targetRecipes.length}.`
    );
  }

  const links: Array<{ recipeId: string; bodyTypeSlug: string }> = [];
  const linkCounts = Object.fromEntries(
    BODY_TYPES.map((bodyType) => [bodyType.slug, 0])
  ) as Record<string, number>;
  let multiTaggedRecipes = 0;
  let untaggedRecipes = 0;

  for (const sourceRecipe of sourceRecipes) {
    const enabled = enabledBodyTypes(sourceRecipe);

    if (enabled.length > 1) {
      multiTaggedRecipes += 1;
    }

    if (enabled.length === 0) {
      untaggedRecipes += 1;
    }

    for (const bodyType of enabled) {
      links.push({
        recipeId: targetIdBySourceId.get(sourceRecipe.id)!,
        bodyTypeSlug: bodyType.slug,
      });
      linkCounts[bodyType.slug] += 1;
    }
  }

  const audit: ImportAudit = {
    sourceRecipeCount: sourceRecipes.length,
    targetRecipeCount: targetRecipes.length,
    totalLinks: links.length,
    multiTaggedRecipes,
    untaggedRecipes,
    linkCounts,
  };

  return { links, targetRecipes, audit };
}

async function uploadBodyTypeImage(
  client: S3Client,
  mediaBucket: string,
  imageDirectory: string,
  bodyTypeId: string,
  imageFile: string
) {
  const key = `bodyTypes/${bodyTypeId}/${imageFile}`;

  await client.send(
    new PutObjectCommand({
      Bucket: mediaBucket,
      Key: key,
      Body: await readFile(path.join(imageDirectory, imageFile)),
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return publicMediaUrl(key);
}

function logAudit(audit: ImportAudit) {
  console.log(`Source recipes: ${audit.sourceRecipeCount}`);
  console.log(`Matched imported recipes: ${audit.targetRecipeCount}`);
  console.log(`Exact recipe/body type links: ${audit.totalLinks}`);
  console.log(`Multi-tagged recipes: ${audit.multiTaggedRecipes}`);
  console.log(`Source recipes without body type tags: ${audit.untaggedRecipes}`);
  console.log(
    `Per body type links: ${BODY_TYPES.map(
      (bodyType) => `${bodyType.title}=${audit.linkCounts[bodyType.slug]}`
    ).join(", ")}`
  );
}

async function main() {
  requireEnv("DATABASE_URL");

  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({
    datasources: { db: { url: getSourceDatabaseUrl() } },
  });

  try {
    const imageDirectory = await assertImagesExist();
    const { links, targetRecipes, audit } = await buildImportRows(
      sourceDb,
      targetDb
    );

    console.log(`Body type image directory: ${imageDirectory}`);
    logAudit(audit);

    if (!shouldApply) {
      console.log(
        "Dry run complete. Run with --apply to upload body type images and write exact source relations."
      );
      return;
    }

    const mediaBucket = requireEnv("AWS_MEDIA_BUCKET_NAME");
    const s3 = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
    const bodyTypeIdBySlug = new Map<string, string>();

    for (const bodyType of BODY_TYPES) {
      const savedBodyType = await targetDb.bodyTypes.upsert({
        where: { slug: bodyType.slug },
        update: { title: bodyType.title, position: bodyType.position },
        create: {
          title: bodyType.title,
          slug: bodyType.slug,
          position: bodyType.position,
        },
      });
      const imageUrl = await uploadBodyTypeImage(
        s3,
        mediaBucket,
        imageDirectory,
        savedBodyType.id,
        bodyType.imageFile
      );

      await targetDb.bodyTypes.update({
        where: { id: savedBodyType.id },
        data: { imageUrl },
      });
      bodyTypeIdBySlug.set(bodyType.slug, savedBodyType.id);
      console.log(`Uploaded ${bodyType.title} image -> ${imageUrl}`);
    }

    await targetDb.$transaction(async (transaction) => {
      await transaction.recipeBodyType.deleteMany({
        where: { recipeId: { in: targetRecipes.map((recipe) => recipe.id) } },
      });
      await transaction.recipeBodyType.createMany({
        data: links.map((link) => ({
          recipeId: link.recipeId,
          bodyTypeId: bodyTypeIdBySlug.get(link.bodyTypeSlug)!,
        })),
        skipDuplicates: true,
      });
    });

    const savedBodyTypes = await targetDb.bodyTypes.findMany({
      where: { slug: { in: BODY_TYPES.map((bodyType) => bodyType.slug) } },
      select: {
        slug: true,
        _count: { select: { recipeBodyTypes: true } },
      },
    });
    const persistedLinkCount = savedBodyTypes.reduce(
      (count, bodyType) => count + bodyType._count.recipeBodyTypes,
      0
    );

    if (persistedLinkCount !== audit.totalLinks) {
      throw new Error(
        `Persisted body type link count mismatch: expected=${audit.totalLinks}, actual=${persistedLinkCount}.`
      );
    }

    for (const bodyType of savedBodyTypes) {
      if (bodyType._count.recipeBodyTypes !== audit.linkCounts[bodyType.slug]) {
        throw new Error(
          `Persisted ${bodyType.slug} link count mismatch: expected=${audit.linkCounts[bodyType.slug]}, actual=${bodyType._count.recipeBodyTypes}.`
        );
      }
    }

    console.log("Body types and exact recipe relations imported successfully.");
    logAudit(audit);
  } finally {
    await Promise.all([sourceDb.$disconnect(), targetDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error("[BODY_TYPES_IMPORT]", error);
  process.exit(1);
});
