const fs = require("node:fs");
const path = require("node:path");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const catalog = require("../data/meal-plan/early-morning-recipes.json");
const imageManifest = require("../data/meal-plan/early-morning-image-manifest.json");
const imageDirectory =
  process.env.EARLY_MORNING_IMAGE_DIR || imageManifest.baseDirectory;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function mediaUrlForKey(key) {
  return `${requiredEnv("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "")}/${key}`;
}

function s3Client() {
  return new S3Client({
    region: requiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

function manifestItemForSlug(slug) {
  return imageManifest.items.find((item) => item.slug === slug);
}

async function uploadRecipeImage(client, recipe, manifestItem) {
  if (!imageDirectory) {
    throw new Error(
      "EARLY_MORNING_IMAGE_DIR is required to upload local generated images.",
    );
  }

  const fileName = manifestItem.fileName || path.basename(manifestItem.targetPath || "");
  const targetPath = path.resolve(imageDirectory, fileName);
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing generated image for ${recipe.slug}: ${targetPath}`);
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isFile() || stat.size < 1) {
    throw new Error(`Invalid generated image for ${recipe.slug}: ${targetPath}`);
  }

  const key = `recipes/${recipe.id}/${fileName}`;
  const body = fs.readFileSync(targetPath);

  await client.send(
    new PutObjectCommand({
      Bucket: requiredEnv("AWS_MEDIA_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicUrl = mediaUrlForKey(key);

  await db.recipes.update({
    where: { id: recipe.id },
    data: {
      imageUrl: publicUrl,
      contentUpdatedAt: new Date(),
    },
  });

  await db.mediaAsset.upsert({
    where: { url: publicUrl },
    create: {
      name: fileName,
      url: publicUrl,
      storageKey: key,
      mimeType: "image/webp",
      mediaType: "image",
      fileSize: BigInt(stat.size),
      altText: manifestItem.title,
    },
    update: {
      name: fileName,
      storageKey: key,
      mimeType: "image/webp",
      mediaType: "image",
      fileSize: BigInt(stat.size),
      altText: manifestItem.title,
    },
  });

  return { slug: recipe.slug, key, publicUrl, size: stat.size };
}

async function main() {
  loadEnvFile(envPath);

  const slugs = catalog.recipes.map((recipe) => recipe.slug);
  const recipes = await db.recipes.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const recipeBySlug = new Map(recipes.map((recipe) => [recipe.slug, recipe]));

  const missingRecipes = slugs.filter((slug) => !recipeBySlug.has(slug));
  if (missingRecipes.length > 0) {
    throw new Error(`Missing recipes in DB: ${missingRecipes.join(", ")}`);
  }

  const client = s3Client();
  const uploaded = [];

  for (const catalogRecipe of catalog.recipes) {
    const recipe = recipeBySlug.get(catalogRecipe.slug);
    const manifestItem = manifestItemForSlug(catalogRecipe.slug);
    if (!manifestItem) {
      throw new Error(`Missing image manifest item: ${catalogRecipe.slug}`);
    }

    uploaded.push(await uploadRecipeImage(client, recipe, manifestItem));
  }

  console.log(`Uploaded ${uploaded.length} early-morning recipe images:`);
  for (const item of uploaded) {
    console.log(`- ${item.slug} -> ${item.publicUrl}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
