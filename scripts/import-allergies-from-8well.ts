import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

type SourceAllergy = {
  id: number;
  name: string;
};

type ImportRow = {
  sourceId: number;
  title: string;
  slug: string;
  imageFile: string;
  imagePath: string;
  position: number;
};

const DEFAULT_SOURCE_DATABASE_NAME = "8well";
const DEFAULT_IMAGE_DIRECTORY =
  "/Users/shivaan/My Personal Data/kyakhayen data/tags image/allergies";
const LEGACY_PLACEHOLDER_SLUGS = ["dairy-free", "gluten-free"];
const shouldApply = process.argv.includes("--apply");

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to import allergies.`);
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

async function buildImportRows(sourceDb: PrismaClient) {
  const sourceRecords = await sourceDb.$queryRawUnsafe<SourceAllergy[]>(
    "SELECT id, name FROM allergies ORDER BY id"
  );
  const imageDirectory =
    process.env.ALLERGY_IMAGE_SOURCE_DIR ?? DEFAULT_IMAGE_DIRECTORY;
  const imageFiles = (await readdir(imageDirectory)).filter((file) =>
    file.toLowerCase().endsWith(".webp")
  );
  const imageBySlug = new Map(
    imageFiles.map((file) => [path.basename(file, path.extname(file)), file])
  );
  const slugs = new Set<string>();
  const missingImages: string[] = [];

  const rows = sourceRecords.map((sourceRecord, index) => {
    const title = sourceRecord.name.trim();
    const slug = slugify(title);
    const imageFile = imageBySlug.get(slug);

    if (slugs.has(slug)) {
      throw new Error(`Duplicate source allergy slug found: ${slug}`);
    }
    slugs.add(slug);

    if (!imageFile) {
      missingImages.push(`${sourceRecord.id}: ${title} (${slug}.webp)`);
    }

    return {
      sourceId: sourceRecord.id,
      title,
      slug,
      imageFile: imageFile ?? "",
      imagePath: imageFile ? path.join(imageDirectory, imageFile) : "",
      position: index + 1,
    };
  });
  const unusedImages = imageFiles.filter(
    (imageFile) => !slugs.has(path.basename(imageFile, path.extname(imageFile)))
  );

  if (missingImages.length > 0) {
    throw new Error(`Missing allergy images:\n${missingImages.join("\n")}`);
  }

  return { rows, unusedImages, imageDirectory };
}

async function main() {
  requireEnv("DATABASE_URL");

  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({
    datasources: { db: { url: getSourceDatabaseUrl() } },
  });

  try {
    const { rows, unusedImages, imageDirectory } = await buildImportRows(sourceDb);
    const placeholders = await targetDb.allergies.findMany({
      where: { slug: { in: LEGACY_PLACEHOLDER_SLUGS } },
      include: {
        _count: { select: { recipeAllergies: true, UserAllrgies: true } },
      },
    });
    const usedPlaceholders = placeholders.filter(
      (record) => record._count.recipeAllergies > 0 || record._count.UserAllrgies > 0
    );

    if (usedPlaceholders.length > 0) {
      throw new Error(
        `Legacy placeholders are attached to data and cannot be removed: ${usedPlaceholders
          .map((record) => record.slug)
          .join(", ")}`
      );
    }

    console.log(`Source rows: ${rows.length}`);
    console.log(`Matched images: ${rows.length}/${rows.length}`);
    console.log(`Image directory: ${imageDirectory}`);
    console.log(`Unused image files: ${unusedImages.length}`);
    console.log(`Removable legacy placeholders: ${placeholders.map((row) => row.slug).join(", ") || "none"}`);

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply to upload images and write allergy records.");
      return;
    }

    const mediaBucket = requireEnv("AWS_MEDIA_BUCKET_NAME");
    const client = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });

    for (const row of rows) {
      const allergy = await targetDb.allergies.upsert({
        where: { slug: row.slug },
        update: { title: row.title, position: row.position },
        create: { title: row.title, slug: row.slug, position: row.position },
      });
      const key = `allergies/${allergy.id}/${row.imageFile}`;

      await client.send(
        new PutObjectCommand({
          Bucket: mediaBucket,
          Key: key,
          Body: await readFile(row.imagePath),
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      await targetDb.allergies.update({
        where: { id: allergy.id },
        data: { imageUrl: publicMediaUrl(key) },
      });

      console.log(`Imported ${row.position}. ${row.title} -> ${key}`);
    }

    const removedPlaceholders = await targetDb.allergies.deleteMany({
      where: {
        slug: { in: LEGACY_PLACEHOLDER_SLUGS },
        recipeAllergies: { none: {} },
        UserAllrgies: { none: {} },
      },
    });

    console.log(`Imported allergies: ${rows.length}`);
    console.log(`Removed legacy placeholders: ${removedPlaceholders.count}`);
  } finally {
    await Promise.all([sourceDb.$disconnect(), targetDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error("[ALLERGIES_IMPORT]", error);
  process.exit(1);
});
