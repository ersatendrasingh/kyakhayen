import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

type SourceRecord = {
  id: number;
  name: string;
};

type SourceTag = SourceRecord & {
  category_id: number;
};

type MediaRow = {
  title: string;
  slug: string;
  imageFile: string;
  position: number;
};

const DEFAULT_SOURCE_DATABASE_NAME = "8well";
const MEDIA_ROOT =
  process.env.RECIPE_MASTER_IMAGE_SOURCE_DIR ??
  "/Users/shivaan/My Personal Data/kyakhayen data/tags image";
const shouldApply = process.argv.includes("--apply");

const CATEGORY_ROWS: MediaRow[] = [
  { title: "Veg", slug: "veg", imageFile: "vegetarian.webp", position: 1 },
  { title: "Eggetarian", slug: "eggetarian", imageFile: "eggetarian.webp", position: 2 },
  { title: "Vegan", slug: "vegan", imageFile: "vegan.webp", position: 3 },
  {
    title: "Pescetarian",
    slug: "pescetarian",
    imageFile: "pescetarian.webp",
    position: 4,
  },
  { title: "Non Veg", slug: "non-veg", imageFile: "non-veg.webp", position: 5 },
];

const CUISINE_TITLES: Record<string, string> = {
  "Gujrati": "Gujarati",
  "Thai Recipe": "Thai",
  "Mexican Recipe": "Mexican",
  "Indian -North Indian": "North Indian",
  "Indian- South Indian": "South Indian",
  "Indian- West Indian": "West Indian",
  "Indian- Easten Indian": "East Indian",
  "International -Mediterranean": "International Mediterranean",
  "International- PAN Asian": "International Pan Asian",
  "International - Continental": "International Continental",
  "International - Latino": "International Latino",
};

const CUISINE_IMAGE_SLUGS: Record<string, string> = {
  Gujarati: "gujrati",
};

const COOKING_METHOD_SLUGS: Record<string, string> = {
  Baking: "bake",
  Boiling: "boil",
  Sauteing: "saute",
};

const LEGACY_SEED_RECIPE_TITLES = [
  "Protein Paneer Bowl",
  "Spinach Energy Soup",
  "Overnight Oats With Fruit",
  "Chickpea Mediterranean Salad",
];

const LEGACY_SEED_MASTERS = {
  recipeCategories: ["high-protein", "quick-meals"],
  cuisines: ["indian", "mediterranean", "continental"],
  mealTimes: ["evening-snack"],
  dietTypes: ["balanced", "high-protein"],
  recipeTypes: ["daily-meal", "meal-prep"],
  nutrients: ["protein", "fiber", "iron"],
  difficulties: ["Beginner", "Advanced"],
};

const LEGACY_SEED_INGREDIENT_NAMES = ["Oats", "Chickpeas", "Spinach"];
const LEGACY_SEED_INGREDIENT_CATEGORY_SLUGS = ["essentials"];

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to import recipe masters.`);
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

async function imageMap(directoryName: string) {
  const directory = path.join(MEDIA_ROOT, directoryName);
  const files = (await readdir(directory)).filter((file) =>
    file.toLowerCase().endsWith(".webp")
  );

  return {
    directory,
    bySlug: new Map(
      files.map((file) => [
        slugify(path.basename(file, path.extname(file))),
        file,
      ])
    ),
  };
}

function cleanTitle(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function cookingMethodTitle(title: string) {
  return title
    .replace("Dry heat", "Dry Heat")
    .replace("Deep frying", "Deep Frying")
    .replace("Shallow frying", "Shallow Frying")
    .replace("Moist heating", "Moist Heating");
}

async function uploadImage(
  client: S3Client,
  bucket: string,
  prefix: string,
  recordId: string,
  directory: string,
  imageFile: string
) {
  const key = `${prefix}/${recordId}/${imageFile}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: await readFile(path.join(directory, imageFile)),
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return publicMediaUrl(key);
}

async function legacySeedSummary(targetDb: PrismaClient) {
  const [
    recipes,
    categories,
    cuisines,
    mealTimes,
    dietTypes,
    recipeTypes,
    nutrients,
    difficulties,
    ingredients,
    ingredientCategories,
  ] = await Promise.all([
    targetDb.recipes.count({ where: { title: { in: LEGACY_SEED_RECIPE_TITLES } } }),
    targetDb.recipeCategories.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.recipeCategories } },
    }),
    targetDb.cuisines.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.cuisines } },
    }),
    targetDb.mealTimes.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.mealTimes } },
    }),
    targetDb.dietTypes.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.dietTypes } },
    }),
    targetDb.recipeTypes.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.recipeTypes } },
    }),
    targetDb.nutrient.count({
      where: { slug: { in: LEGACY_SEED_MASTERS.nutrients } },
    }),
    targetDb.recipeDifficulty.count({
      where: { title: { in: LEGACY_SEED_MASTERS.difficulties } },
    }),
    targetDb.ingredients.count({
      where: {
        name: { in: LEGACY_SEED_INGREDIENT_NAMES },
        sourceSystem: null,
      },
    }),
    targetDb.ingredientCategories.count({
      where: { slug: { in: LEGACY_SEED_INGREDIENT_CATEGORY_SLUGS } },
    }),
  ]);

  return {
    recipes,
    categories,
    cuisines,
    mealTimes,
    dietTypes,
    recipeTypes,
    nutrients,
    difficulties,
    ingredients,
    ingredientCategories,
  };
}

async function removeLegacySeedData(targetDb: PrismaClient) {
  const before = await legacySeedSummary(targetDb);

  await targetDb.$transaction(async (transaction) => {
    await transaction.recipes.deleteMany({
      where: { title: { in: LEGACY_SEED_RECIPE_TITLES } },
    });
    await transaction.recipeCategories.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.recipeCategories } },
    });
    await transaction.cuisines.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.cuisines } },
    });
    await transaction.mealTimes.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.mealTimes } },
    });
    await transaction.dietTypes.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.dietTypes } },
    });
    await transaction.recipeTypes.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.recipeTypes } },
    });
    await transaction.nutrient.deleteMany({
      where: { slug: { in: LEGACY_SEED_MASTERS.nutrients } },
    });
    await transaction.recipeDifficulty.deleteMany({
      where: { title: { in: LEGACY_SEED_MASTERS.difficulties } },
    });

    const orphanIngredients = await transaction.ingredients.findMany({
      where: {
        name: { in: LEGACY_SEED_INGREDIENT_NAMES },
        sourceSystem: null,
        RecipeIngredients: { none: {} },
      },
      select: { id: true },
    });

    if (orphanIngredients.length > 0) {
      const orphanIngredientIds = orphanIngredients.map((ingredient) => ingredient.id);

      await transaction.ingredientUnitMeasurements.deleteMany({
        where: { ingredientId: { in: orphanIngredientIds } },
      });
      await transaction.ingredients.deleteMany({
        where: { id: { in: orphanIngredientIds } },
      });
    }

    await transaction.ingredientCategories.deleteMany({
      where: {
        slug: { in: LEGACY_SEED_INGREDIENT_CATEGORY_SLUGS },
        ingredient: { none: {} },
      },
    });
  });

  return before;
}

async function main() {
  requireEnv("DATABASE_URL");

  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({
    datasources: { db: { url: getSourceDatabaseUrl() } },
  });

  try {
    const [categoryImages, cuisineImages, mealTimeImages] = await Promise.all([
      imageMap("categories"),
      imageMap("cuisines"),
      imageMap("mealTimes"),
    ]);
    const sourceFoodPreferences = await sourceDb.$queryRawUnsafe<SourceRecord[]>(
      "SELECT id, name FROM food_prefs ORDER BY id"
    );
    const sourceCuisines = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 2 ORDER BY id"
    );
    const sourceDietTypes = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 3 ORDER BY id"
    );
    const sourceNutrients = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 1 ORDER BY id"
    );
    const sourceSeasons = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 6 ORDER BY id"
    );
    const sourceDifficulties = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 7 ORDER BY id"
    );
    const sourceCookingMethods = await sourceDb.$queryRawUnsafe<SourceTag[]>(
      "SELECT id, name, category_id FROM recipe_tags WHERE category_id = 8 ORDER BY id"
    );
    const sourceRecipeTypes = await sourceDb.$queryRawUnsafe<SourceRecord[]>(
      "SELECT id, name FROM recipe_types ORDER BY id"
    );
    const sourceMealTimes = await sourceDb.$queryRawUnsafe<
      Array<SourceRecord & { diet: number }>
    >("SELECT id, name, diet FROM mealtimes WHERE diet = 1 ORDER BY id");

    const missingCategoryImages = CATEGORY_ROWS.filter(
      (row) => !categoryImages.bySlug.has(slugify(path.parse(row.imageFile).name))
    );
    const cuisineRowsBySlug = new Map<string, MediaRow>();

    for (const [index, sourceCuisine] of sourceCuisines.entries()) {
      const sourceTitle = cleanTitle(sourceCuisine.name);
      const title = CUISINE_TITLES[sourceTitle] ?? sourceTitle;
      const slug = slugify(title);
      const imageSlug = CUISINE_IMAGE_SLUGS[title] ?? slug;
      const imageFile = cuisineImages.bySlug.get(imageSlug);

      if (!imageFile) {
        throw new Error(`Missing cuisine image for ${title} (${imageSlug}.webp).`);
      }

      if (!cuisineRowsBySlug.has(slug)) {
        cuisineRowsBySlug.set(slug, {
          title,
          slug,
          imageFile,
          position: index + 1,
        });
      }
    }

    const cuisineRows = Array.from(cuisineRowsBySlug.values()).map(
      (row, index) => ({ ...row, position: index + 1 })
    );
    const mealTimeRows = sourceMealTimes.map((sourceMealTime, index) => {
      const title = cleanTitle(sourceMealTime.name);
      const slug = slugify(title);
      const imageFile = mealTimeImages.bySlug.get(slug);

      if (!imageFile) {
        throw new Error(`Missing meal time image for ${title} (${slug}.webp).`);
      }

      return { title, slug, imageFile, position: index + 1 };
    });

    if (missingCategoryImages.length > 0) {
      throw new Error(
        `Missing preference category images: ${missingCategoryImages
          .map((row) => row.imageFile)
          .join(", ")}`
      );
    }

    const dietTypes = sourceDietTypes
      .map((row) => cleanTitle(row.name))
      .filter((title) => title !== "Detox");
    const nutrients = sourceNutrients
      .map((row) => cleanTitle(row.name))
      .filter((title) => title !== "Detox Recipe");
    const cookingMethods = sourceCookingMethods.map((row) =>
      cookingMethodTitle(cleanTitle(row.name))
    );
    const seedSummary = await legacySeedSummary(targetDb);

    console.log(`Source food preference rows consolidated: ${sourceFoodPreferences.length} -> ${CATEGORY_ROWS.length}`);
    console.log(`Recipe preference categories with images: ${CATEGORY_ROWS.length}`);
    console.log(`Cuisines with images (canonicalized): ${sourceCuisines.length} -> ${cuisineRows.length}`);
    console.log(`Meal times with images: ${mealTimeRows.length}`);
    console.log(`Cooking methods (no matching local image folder): ${cookingMethods.length}`);
    console.log(`Diet types imported, excluding Detox claim: ${dietTypes.length}`);
    console.log(`Nutrient tags imported, excluding Detox Recipe: ${nutrients.length}`);
    console.log(`Recipe types imported: ${sourceRecipeTypes.length}`);
    console.log(`Seasons imported: ${sourceSeasons.length}`);
    console.log(`Difficulty levels imported: ${sourceDifficulties.length}`);
    console.log(`Legacy seed data pending cleanup: ${JSON.stringify(seedSummary)}`);

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply to upload matching images and write master records.");
      return;
    }

    const mediaBucket = requireEnv("AWS_MEDIA_BUCKET_NAME");
    const storageClient = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });

    for (const row of CATEGORY_ROWS) {
      const record = await targetDb.recipeCategories.upsert({
        where: { slug: row.slug },
        update: { name: row.title, position: row.position },
        create: { name: row.title, slug: row.slug, position: row.position },
      });
      const imageUrl = await uploadImage(
        storageClient,
        mediaBucket,
        "categories",
        record.id,
        categoryImages.directory,
        row.imageFile
      );
      await targetDb.recipeCategories.update({
        where: { id: record.id },
        data: { imageUrl },
      });
    }

    for (const row of cuisineRows) {
      const record = await targetDb.cuisines.upsert({
        where: { slug: row.slug },
        update: { title: row.title, position: row.position },
        create: { title: row.title, slug: row.slug, position: row.position },
      });
      const imageUrl = await uploadImage(
        storageClient,
        mediaBucket,
        "cuisines",
        record.id,
        cuisineImages.directory,
        row.imageFile
      );
      await targetDb.cuisines.update({
        where: { id: record.id },
        data: { imageUrl },
      });
    }

    for (const row of mealTimeRows) {
      const record = await targetDb.mealTimes.upsert({
        where: { slug: row.slug },
        update: { title: row.title, position: row.position },
        create: { title: row.title, slug: row.slug, position: row.position },
      });
      const imageUrl = await uploadImage(
        storageClient,
        mediaBucket,
        "mealTimes",
        record.id,
        mealTimeImages.directory,
        row.imageFile
      );
      await targetDb.mealTimes.update({
        where: { id: record.id },
        data: { imageUrl },
      });
    }

    for (const [position, title] of cookingMethods.entries()) {
      const slug = COOKING_METHOD_SLUGS[title] ?? slugify(title);
      await targetDb.cookingMethods.upsert({
        where: { slug },
        update: { title, position: position + 1 },
        create: { title, slug, position: position + 1 },
      });
    }

    for (const [position, title] of dietTypes.entries()) {
      const slug = slugify(title);
      await targetDb.dietTypes.upsert({
        where: { slug },
        update: { title, position: position + 1 },
        create: { title, slug, position: position + 1 },
      });
    }

    for (const [position, title] of nutrients.entries()) {
      const slug = slugify(title);
      await targetDb.nutrient.upsert({
        where: { slug },
        update: { title, position: position + 1 },
        create: { title, slug, position: position + 1 },
      });
    }

    for (const [position, sourceRecipeType] of sourceRecipeTypes.entries()) {
      const title = cleanTitle(sourceRecipeType.name);
      const slug = slugify(title);
      await targetDb.recipeTypes.upsert({
        where: { slug },
        update: { title, position: position + 1 },
        create: { title, slug, position: position + 1 },
      });
    }

    for (const sourceSeason of sourceSeasons) {
      const title = cleanTitle(sourceSeason.name);
      const existing = await targetDb.recipeSeasons.findFirst({ where: { title } });

      if (!existing) {
        await targetDb.recipeSeasons.create({ data: { title } });
      }
    }

    for (const [position, sourceDifficulty] of sourceDifficulties.entries()) {
      const title = cleanTitle(sourceDifficulty.name);
      const existing = await targetDb.recipeDifficulty.findFirst({
        where: { title },
      });

      if (existing) {
        await targetDb.recipeDifficulty.update({
          where: { id: existing.id },
          data: { position: position + 1 },
        });
      } else {
        await targetDb.recipeDifficulty.create({
          data: { title, position: position + 1 },
        });
      }
    }

    const removedLegacySeedData = await removeLegacySeedData(targetDb);
    console.log(`Removed legacy seed data: ${JSON.stringify(removedLegacySeedData)}`);
    console.log("Recipe master import complete.");
  } finally {
    await Promise.all([sourceDb.$disconnect(), targetDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error("[RECIPE_MASTER_IMPORT]", error);
  process.exit(1);
});
