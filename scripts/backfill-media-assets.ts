import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

import { getVerifiedPublicMediaKey } from "../lib/s3utils";

loadEnvConfig(process.cwd());

const db = new PrismaClient();
const shouldApply = process.argv.includes("--apply");

type ReferencedMedia = {
  url: string;
  kind: "image" | "video";
  source: string;
};

function mimeTypeFor(url: string, kind: ReferencedMedia["kind"]) {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  const types: Record<string, string> = {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };

  return types[extension] ?? (kind === "video" ? "video/mp4" : "image/webp");
}

function nameFor(url: string) {
  const fileName = decodeURIComponent(path.basename(new URL(url).pathname));
  return fileName || "imported-media";
}

function defaultAltText(url: string) {
  return nameFor(url)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

async function publicFileSize(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return 0;
    return Number(response.headers.get("content-length")) || 0;
  } catch {
    return 0;
  }
}

async function references() {
  const [
    recipes,
    steps,
    categories,
    difficulty,
    cookingMethods,
    bodyTypes,
    cuisines,
    allergies,
    mealTimes,
    nutrients,
    dietTypes,
    recipeTypes,
    ingredients,
    ingredientCategories,
    genders,
    posts,
    articleCategories,
  ] = await Promise.all([
    db.recipes.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.recipeMethods.findMany({
      where: { OR: [{ imageUrl: { not: null } }, { videoUrl: { not: null } }] },
      select: { imageUrl: true, videoUrl: true },
    }),
    db.recipeCategories.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.recipeDifficulty.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.cookingMethods.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.bodyTypes.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.cuisines.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.allergies.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.mealTimes.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.nutrient.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.dietTypes.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.recipeTypes.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.ingredients.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.ingredientCategories.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.gender.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.post.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    db.category.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
  ]);

  const all: ReferencedMedia[] = [
    ...recipes.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Recipes" })),
    ...steps.flatMap((row) => [
      ...(row.imageUrl ? [{ url: row.imageUrl, kind: "image" as const, source: "RecipeMethods.imageUrl" }] : []),
      ...(row.videoUrl ? [{ url: row.videoUrl, kind: "video" as const, source: "RecipeMethods.videoUrl" }] : []),
    ]),
    ...categories.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "RecipeCategories" })),
    ...difficulty.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "RecipeDifficulty" })),
    ...cookingMethods.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "CookingMethods" })),
    ...bodyTypes.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "BodyTypes" })),
    ...cuisines.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Cuisines" })),
    ...allergies.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Allergies" })),
    ...mealTimes.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "MealTimes" })),
    ...nutrients.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Nutrient" })),
    ...dietTypes.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "DietTypes" })),
    ...recipeTypes.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "RecipeTypes" })),
    ...ingredients.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Ingredients" })),
    ...ingredientCategories.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "IngredientCategories" })),
    ...genders.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Gender" })),
    ...posts.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Post" })),
    ...articleCategories.map((row) => ({ url: row.imageUrl!, kind: "image" as const, source: "Category" })),
  ];

  return all;
}

async function main() {
  const referenced = await references();
  const byUrl = new Map<string, ReferencedMedia>();
  const invalid: ReferencedMedia[] = [];

  for (const media of referenced) {
    try {
      getVerifiedPublicMediaKey(media.url);
      byUrl.set(media.url, media);
    } catch {
      invalid.push(media);
    }
  }

  console.log(`Referenced media values: ${referenced.length}`);
  console.log(`Unique CloudFront media assets: ${byUrl.size}`);
  console.log(`Skipped non-library URLs: ${invalid.length}`);

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply to register existing media in MediaAsset.");
    return;
  }

  let upserted = 0;
  let sized = 0;
  for (const media of byUrl.values()) {
    const storageKey = getVerifiedPublicMediaKey(media.url);
    const fileSize = await publicFileSize(media.url);
    if (fileSize > 0) sized += 1;
    const asset = await db.mediaAsset.upsert({
      where: { url: media.url },
      create: {
        name: nameFor(media.url),
        url: media.url,
        storageKey,
        mimeType: mimeTypeFor(media.url, media.kind),
        mediaType: media.kind,
        fileSize: BigInt(fileSize),
        altText: media.kind === "image" ? defaultAltText(media.url) : null,
      },
      update: {
        storageKey,
        mimeType: mimeTypeFor(media.url, media.kind),
        mediaType: media.kind,
        ...(fileSize > 0 ? { fileSize: BigInt(fileSize) } : {}),
      },
    });
    if (media.kind === "image" && !asset.altText) {
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: { altText: defaultAltText(media.url) },
      });
    }
    upserted += 1;
  }

  console.log(`Media library records upserted: ${upserted}`);
  console.log(`Media assets with S3 file size: ${sized}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
