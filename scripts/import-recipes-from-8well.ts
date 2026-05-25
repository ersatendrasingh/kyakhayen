import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

type SourceRecipe = {
  id: number;
  name: string;
  is_verified: number;
  steps: string | null;
  ingrs_list: string | null;
  time_for_preparation: string | null;
  recipe_type_id: number;
  nutrient_tag_id_1: number | null;
  nutrient_tag_id_2: number | null;
  cuisine_tag_ids: string | null;
  type_of_diet_tag_id: number | null;
  misc_tag_ids: string | null;
  recipe_by_seasons_tag_ids: string | null;
  recipe_by_difficulty_level_tag_ids: string | null;
  cooking_method_tag_ids: string | null;
  allergy_ids: string | null;
  isveg: number;
  breakfast: number;
  midmorning: number;
  lunch: number;
  evening: number;
  dinner: number;
};

type SourceNamedRow = {
  id: number;
  name: string;
};

type SourceIngredientEntry = {
  sourceIngredientId: number;
  sourceFormId: number;
  quantity: number;
  sourceUnitId: number;
};

type LocalImage = {
  filePath: string;
  imageKey: string;
};

const SOURCE_SYSTEM = "8well";
const SOURCE_DATABASE_NAME = "8well";
const RECIPE_IMAGE_ROOT =
  process.env.RECIPE_IMAGE_SOURCE_DIR ??
  "/Users/shivaan/My Personal Data/kyakhayen data/Recipe Images";
const DEFAULT_IMAGE_PATH =
  process.env.DEFAULT_RECIPE_IMAGE_PATH ??
  path.join(process.cwd(), "public/assets/images/default-recipe.png");
const DEFAULT_IMAGE_KEY = "recipes/default/default-recipe.png";
const shouldApply = process.argv.includes("--apply");

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

const COOKING_METHOD_SLUGS: Record<string, string> = {
  Baking: "bake",
  Boiling: "boil",
  Sauteing: "saute",
};

const IMAGE_ALIASES: Record<string, string> = {
  "kalachana-sprouts-poha": "kala-chana-sprouts-poha",
  "stir-fried-mixed-vegetables": "stir-fried-mix-vegetables",
  "black-masoor-dal": "black-masoor-daal",
  "ragi-cheela": "ragi-chilla",
  "saute-pumpkin": "saute-pumpkin-recipe",
  "spinach-stuffed-wheat-bran-chapati-30-wheat-bran-70-wheat-flour":
    "spinach-stuffed-wheat-branchapati-30-wheat-bran-70-wheat-flour",
  "vegetable-juice-add-beetroot-spinach-cucumber":
    "vegetable-juice-beetroot-spinach-cucumber",
  "stuffed-pea-roti": "stuffed-peas-roti",
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to import recipes.`);
  }

  return value;
}

function sourceDatabaseUrl() {
  if (process.env.SOURCE_8WELL_DATABASE_URL) {
    return process.env.SOURCE_8WELL_DATABASE_URL;
  }

  const url = new URL(requireEnv("DATABASE_URL"));
  url.pathname = `/${SOURCE_DATABASE_NAME}`;
  return url.toString();
}

function publicMediaUrl(key: string) {
  return `${requireEnv("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "")}/${key}`;
}

function cleanTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseIds(value: string | null) {
  return [...new Set(
    String(value ?? "")
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0)
  )];
}

function parseIngredients(value: string | null) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const [ingredientId, formId, quantity, unitId] = entry
        .split("#")
        .map((field) => Number(field));

      if (
        !Number.isInteger(ingredientId) ||
        !Number.isInteger(formId) ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(unitId)
      ) {
        return [];
      }

      return [{
        sourceIngredientId: ingredientId,
        sourceFormId: formId,
        quantity,
        sourceUnitId: unitId,
      }];
    });
}

function recipeSteps(value: string | null) {
  return String(value ?? "")
    .split("_#_")
    .map((step) => step.trim())
    .filter(Boolean);
}

function preparationTime(value: string | null) {
  const minutes = String(value ?? "").match(/\d+/)?.[0];
  return minutes ? Number(minutes) : 0;
}

function neutralDescription(title: string) {
  return `Prepare ${title} using the listed ingredients and step-by-step method.`;
}

function categorySlug(recipe: SourceRecipe) {
  const lowerName = recipe.name.toLowerCase();
  const containsFish = /\b(fish|salmon|tuna|prawn|shrimp)\b/.test(lowerName);
  const containsMeat = /\b(chicken|mutton|meat|lamb|turkey)\b/.test(lowerName);

  if (recipe.type_of_diet_tag_id === 68 || /\bvegan\b/.test(lowerName)) {
    return "vegan";
  }
  if (recipe.isveg === -1 || (/\begg\b/.test(lowerName) && !containsFish && !containsMeat)) {
    return "eggetarian";
  }
  if (recipe.isveg === 0) {
    return containsFish && !containsMeat ? "pescetarian" : "non-veg";
  }
  return "veg";
}

function targetUnitShortName(shortName: string) {
  switch (shortName.trim().toLowerCase()) {
    case "gm":
      return "g";
    case "lit":
      return "l";
    case "to taste":
      return "to-taste";
    case "as required":
      return "as-required";
    default:
      return shortName.trim().toLowerCase();
  }
}

async function localImageFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested: string[][] = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const filePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return localImageFiles(filePath);
      }

      return /\.(webp|png|jpe?g)$/i.test(entry.name) ? [filePath] : [];
    })
  );

  return nested.flat();
}

async function buildImageMap() {
  const files = await localImageFiles(RECIPE_IMAGE_ROOT);
  const bySlug = new Map<string, LocalImage>();

  files.forEach((filePath) => {
    const relative = path.relative(RECIPE_IMAGE_ROOT, filePath);
    const baseSlug = slugify(path.basename(filePath, path.extname(filePath)));
    const extension = path.extname(filePath).toLowerCase();
    const folder = path.dirname(relative) === "." ? "" : `${slugify(path.dirname(relative))}/`;

    bySlug.set(baseSlug, {
      filePath,
      imageKey: `recipes/source/${folder}${baseSlug}${extension}`,
    });
  });

  return { files, bySlug };
}

function resolveImage(recipe: SourceRecipe, images: Map<string, LocalImage>) {
  const recipeSlug = slugify(recipe.name);
  return images.get(recipeSlug) ?? images.get(IMAGE_ALIASES[recipeSlug]);
}

async function upload(
  client: S3Client,
  bucket: string,
  key: string,
  filePath: string,
  contentType: string
) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: await readFile(filePath),
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

async function main() {
  requireEnv("DATABASE_URL");

  const target = new PrismaClient();
  const source = new PrismaClient({ datasources: { db: { url: sourceDatabaseUrl() } } });

  try {
    const [
      sourceRecipes,
      sourceTags,
      sourceRecipeTypes,
      sourceAllergies,
      sourceForms,
      sourceUnits,
      targetIngredients,
      targetCategories,
      targetCuisines,
      targetMealTimes,
      targetCookingMethods,
      targetAllergies,
      targetNutrients,
      targetDietTypes,
      targetRecipeTypes,
      targetSeasons,
      targetDifficulties,
      imageData,
    ] = await Promise.all([
      source.$queryRawUnsafe<SourceRecipe[]>(`
        SELECT id, name, is_verified, steps, ingrs_list, time_for_preparation,
          recipe_type_id, nutrient_tag_id_1, nutrient_tag_id_2, cuisine_tag_ids,
          type_of_diet_tag_id, misc_tag_ids, recipe_by_seasons_tag_ids,
          recipe_by_difficulty_level_tag_ids, cooking_method_tag_ids, allergy_ids,
          isveg, breakfast, midmorning, lunch, evening, dinner
        FROM app_recipes ORDER BY id
      `),
      source.$queryRawUnsafe<(SourceNamedRow & { category_id: number })[]>(
        "SELECT id, name, category_id FROM recipe_tags ORDER BY id"
      ),
      source.$queryRawUnsafe<SourceNamedRow[]>("SELECT id, name FROM recipe_types ORDER BY id"),
      source.$queryRawUnsafe<SourceNamedRow[]>("SELECT id, name FROM allergies ORDER BY id"),
      source.$queryRawUnsafe<SourceNamedRow[]>("SELECT id, name FROM ingredient_meta_data ORDER BY id"),
      source.$queryRawUnsafe<(SourceNamedRow & { short_name: string; diet: number })[]>(
        "SELECT id, name, short_name, diet FROM units WHERE diet = 1 ORDER BY id"
      ),
      target.ingredients.findMany({
        where: { sourceSystem: SOURCE_SYSTEM },
        select: { id: true, sourceId: true, isPublished: true },
      }),
      target.recipeCategories.findMany({ select: { id: true, slug: true } }),
      target.cuisines.findMany({ select: { id: true, slug: true } }),
      target.mealTimes.findMany({ select: { id: true, slug: true } }),
      target.cookingMethods.findMany({ select: { id: true, slug: true } }),
      target.allergies.findMany({ select: { id: true, slug: true } }),
      target.nutrient.findMany({ select: { id: true, slug: true } }),
      target.dietTypes.findMany({ select: { id: true, slug: true } }),
      target.recipeTypes.findMany({ select: { id: true, slug: true } }),
      target.recipeSeasons.findMany({ select: { id: true, title: true } }),
      target.recipeDifficulty.findMany({ select: { id: true, title: true } }),
      buildImageMap(),
    ]);

    const sourceTagMap = new Map(sourceTags.map((tag) => [tag.id, tag]));
    const sourceRecipeTypeMap = new Map(sourceRecipeTypes.map((item) => [item.id, item]));
    const sourceAllergyMap = new Map(sourceAllergies.map((item) => [item.id, item]));
    const ingredientMap = new Map(
      targetIngredients.filter((ingredient) => ingredient.sourceId !== null).map((ingredient) => [
        ingredient.sourceId as number,
        ingredient,
      ])
    );
    const categoryMap = new Map(targetCategories.map((item) => [item.slug, item.id]));
    const cuisineMap = new Map(targetCuisines.map((item) => [item.slug, item.id]));
    const mealTimeMap = new Map(targetMealTimes.map((item) => [item.slug, item.id]));
    const cookingMethodMap = new Map(targetCookingMethods.map((item) => [item.slug, item.id]));
    const allergyMap = new Map(targetAllergies.map((item) => [item.slug, item.id]));
    const nutrientMap = new Map(targetNutrients.map((item) => [item.slug, item.id]));
    const dietTypeMap = new Map(targetDietTypes.map((item) => [item.slug, item.id]));
    const recipeTypeMap = new Map(targetRecipeTypes.map((item) => [item.slug, item.id]));
    const seasonMap = new Map(targetSeasons.map((item) => [cleanTitle(item.title), item.id]));
    const difficultyMap = new Map(targetDifficulties.map((item) => [cleanTitle(item.title), item.id]));
    const slugCounts = new Map<string, number>();

    sourceRecipes.forEach((recipe) => {
      const slug = slugify(cleanTitle(recipe.name));
      slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
    });

    const unresolved = {
      category: 0,
      ingredientEntries: 0,
      ingredientRefs: 0,
      cuisines: 0,
      allergies: 0,
      nutrients: 0,
      dietTypes: 0,
      recipeTypes: 0,
      seasons: 0,
      difficulties: 0,
      cookingMethods: 0,
    };
    const intentionalFallbacks = {
      unspecifiedIngredientForms: 0,
      excludedSupplementUnitIngredients: 0,
    };
    let actualImages = 0;
    let safelyPublishable = 0;
    let publishedWithVerifiedNutrition = 0;
    let publishedPendingNutritionReview = 0;
    let neutralizedDescriptions = 0;
    let duplicateSlugRecipes = 0;
    let multiSeasonRecipes = 0;
    let multiDifficultyRecipes = 0;
    const usedImageKeys = new Set<string>();
    const allowedSourceUnitIds = new Set(sourceUnits.map((unit) => unit.id));

    const prepared = sourceRecipes.map((recipe) => {
      const title = cleanTitle(recipe.name);
      const baseSlug = slugify(title);
      const slug =
        (slugCounts.get(baseSlug) ?? 0) > 1 ? `${baseSlug}-${recipe.id}` : baseSlug;
      duplicateSlugRecipes += Number(slug !== baseSlug);
      const steps = recipeSteps(recipe.steps);
      const ingredients = parseIngredients(recipe.ingrs_list);
      const image = resolveImage(recipe, imageData.bySlug);
      const categoryId = categoryMap.get(categorySlug(recipe));
      const recipeTypeName = sourceRecipeTypeMap.get(recipe.recipe_type_id)?.name;
      const recipeTypeId = recipeTypeName
        ? recipeTypeMap.get(slugify(cleanTitle(recipeTypeName)))
        : undefined;
      const cuisineIds = parseIds(recipe.cuisine_tag_ids).flatMap((id) => {
        const raw = sourceTagMap.get(id)?.name;
        const titleValue = raw ? (CUISINE_TITLES[cleanTitle(raw)] ?? cleanTitle(raw)) : "";
        const mapped = cuisineMap.get(slugify(titleValue));
        unresolved.cuisines += Number(!mapped);
        return mapped ? [mapped] : [];
      });
      const dietRaw = recipe.type_of_diet_tag_id
        ? sourceTagMap.get(recipe.type_of_diet_tag_id)?.name
        : null;
      const dietTypeId =
        dietRaw && cleanTitle(dietRaw) !== "Detox"
          ? dietTypeMap.get(slugify(cleanTitle(dietRaw)))
          : undefined;
      const nutrientIds = [recipe.nutrient_tag_id_1, recipe.nutrient_tag_id_2]
        .filter((id): id is number => id !== null)
        .flatMap((id) => {
          const raw = sourceTagMap.get(id)?.name;
          const mapped =
            raw && cleanTitle(raw) !== "Detox Recipe"
              ? nutrientMap.get(slugify(cleanTitle(raw)))
              : undefined;
          unresolved.nutrients += Number(
            raw !== undefined && cleanTitle(raw) !== "Detox Recipe" && !mapped
          );
          return mapped ? [mapped] : [];
        });
      const sourceAllergyIds = parseIds(recipe.allergy_ids);
      const allergyIds = sourceAllergyIds.flatMap((id) => {
        const raw = sourceAllergyMap.get(id)?.name;
        const mapped = raw ? allergyMap.get(slugify(cleanTitle(raw))) : undefined;
        unresolved.allergies += Number(!mapped);
        return mapped ? [mapped] : [];
      });
      const cookingMethodIds = parseIds(recipe.cooking_method_tag_ids).flatMap((id) => {
        const raw = sourceTagMap.get(id)?.name;
        const mapped = raw
          ? cookingMethodMap.get(COOKING_METHOD_SLUGS[cleanTitle(raw)] ?? slugify(cleanTitle(raw)))
          : undefined;
        unresolved.cookingMethods += Number(!mapped);
        return mapped ? [mapped] : [];
      });
      const seasonIds = parseIds(recipe.recipe_by_seasons_tag_ids).flatMap((id) => {
        const raw = sourceTagMap.get(id)?.name;
        const mapped = raw ? seasonMap.get(cleanTitle(raw)) : undefined;
        unresolved.seasons += Number(!mapped);
        return mapped ? [mapped] : [];
      });
      const difficultyIds = parseIds(recipe.recipe_by_difficulty_level_tag_ids).flatMap((id) => {
        const raw = sourceTagMap.get(id)?.name;
        const mapped = raw ? difficultyMap.get(cleanTitle(raw)) : undefined;
        unresolved.difficulties += Number(!mapped);
        return mapped ? [mapped] : [];
      });
      const mealTimeIds = [
        recipe.breakfast ? "breakfast" : null,
        recipe.midmorning ? "mid-morning" : null,
        recipe.lunch ? "lunch" : null,
        recipe.evening ? "evening" : null,
        recipe.dinner ? "dinner" : null,
      ].flatMap((slugValue) => {
        const mapped = slugValue ? mealTimeMap.get(slugValue) : undefined;
        return mapped ? [mapped] : [];
      });
      const mappedIngredients = ingredients.flatMap((entry) => {
        const mapped = ingredientMap.get(entry.sourceIngredientId);
        unresolved.ingredientRefs += Number(!mapped);
        return mapped ? [{ ...entry, ingredient: mapped }] : [];
      });
      const ingredientsSupported = mappedIngredients.every((entry) =>
        allowedSourceUnitIds.has(entry.sourceUnitId)
      );
      const ingredientsComplete =
        ingredients.length > 0 &&
        mappedIngredients.length === ingredients.length &&
        ingredientsSupported;
      const ingredientsTrusted =
        ingredientsComplete &&
        mappedIngredients.every((entry) => entry.ingredient.isPublished);
      const isPublished = Boolean(image);

      unresolved.category += Number(!categoryId);
      unresolved.recipeTypes += Number(!recipeTypeId);
      unresolved.dietTypes += Number(
        dietRaw !== null && dietRaw !== undefined && cleanTitle(dietRaw) !== "Detox" && !dietTypeId
      );
      unresolved.ingredientEntries += Number(ingredients.length === 0);
      intentionalFallbacks.unspecifiedIngredientForms += ingredients.filter(
        (ingredient) => ingredient.sourceFormId === 0
      ).length;
      intentionalFallbacks.excludedSupplementUnitIngredients += mappedIngredients.filter(
        (ingredient) => !allowedSourceUnitIds.has(ingredient.sourceUnitId)
      ).length;
      actualImages += Number(Boolean(image));
      if (image) {
        usedImageKeys.add(image.imageKey);
      }
      safelyPublishable += Number(isPublished);
      publishedWithVerifiedNutrition += Number(isPublished && ingredientsTrusted);
      publishedPendingNutritionReview += Number(isPublished && !ingredientsTrusted);
      neutralizedDescriptions += 1;
      multiSeasonRecipes += Number(seasonIds.length > 1);
      multiDifficultyRecipes += Number(difficultyIds.length > 1);

      return {
        source: recipe,
        title,
        slug,
        description: neutralDescription(title),
        image,
        categoryId,
        recipeTypeId,
        cuisineIds: [...new Set(cuisineIds)],
        dietTypeId,
        nutrientIds: [...new Set(nutrientIds)],
        allergyIds: [...new Set(allergyIds)],
        cookingMethodIds: [...new Set(cookingMethodIds)],
        seasonIds: [...new Set(seasonIds)],
        difficultyIds: [...new Set(difficultyIds)],
        mealTimeIds: [...new Set(mealTimeIds)],
        ingredients: mappedIngredients,
        steps,
        prepTime: preparationTime(recipe.time_for_preparation),
        isPublished,
      };
    });

    console.log(`Source recipes: ${prepared.length}`);
    console.log(`Recipes receiving local images: ${actualImages}`);
    console.log(`Unique local image files used: ${usedImageKeys.size}/${imageData.files.length}`);
    console.log(`Default-image drafts required: ${prepared.length - actualImages}`);
    console.log(`Recipes published with matched images: ${safelyPublishable}`);
    console.log(`Image-published recipes with verified nutrition: ${publishedWithVerifiedNutrition}`);
    console.log(`Image-published recipes pending nutrition display: ${publishedPendingNutritionReview}`);
    console.log(`Duplicate source slugs stabilized with source id: ${duplicateSlugRecipes}`);
    console.log(`Multi-season relations preserved: ${multiSeasonRecipes}`);
    console.log(`Multi-difficulty relations preserved: ${multiDifficultyRecipes}`);
    console.log(`Medical/claim descriptions not copied; neutral descriptions created: ${neutralizedDescriptions}`);
    console.log(`Unresolved mapping summary: ${JSON.stringify(unresolved)}`);
    console.log(`Intentional fallbacks/omissions: ${JSON.stringify(intentionalFallbacks)}`);

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply to upload recipe images and import recipes.");
      return;
    }

    const formMap = new Map<number, string>();
    const unspecifiedForm = await target.ingredientsForm.upsert({
      where: { name: "Unspecified" },
      update: {},
      create: { name: "Unspecified" },
    });
    formMap.set(0, unspecifiedForm.id);

    for (const form of sourceForms) {
      const targetForm = await target.ingredientsForm.upsert({
        where: { name: cleanTitle(form.name) },
        update: {},
        create: { name: cleanTitle(form.name) },
      });
      formMap.set(form.id, targetForm.id);
    }
    const unitMap = new Map<number, string>();
    for (const unit of sourceUnits) {
      const targetUnit = await target.units.findUnique({
        where: { shortName: targetUnitShortName(unit.short_name) },
      });
      if (!targetUnit) {
        continue;
      }
      unitMap.set(unit.id, targetUnit.id);
    }

    const mediaBucket = requireEnv("AWS_MEDIA_BUCKET_NAME");
    const s3 = new S3Client({ region: requireEnv("AWS_REGION") });
    await upload(s3, mediaBucket, DEFAULT_IMAGE_KEY, DEFAULT_IMAGE_PATH, "image/png");

    for (const row of prepared) {
      const imageUrl = row.image
        ? publicMediaUrl(row.image.imageKey)
        : publicMediaUrl(DEFAULT_IMAGE_KEY);

      if (row.image) {
        await upload(s3, mediaBucket, row.image.imageKey, row.image.filePath, "image/webp");
      }

      const recipe = await target.recipes.upsert({
        where: {
          sourceSystem_sourceId: {
            sourceSystem: SOURCE_SYSTEM,
            sourceId: row.source.id,
          },
        },
        update: {
          title: row.title,
          slug: row.slug,
          metaTitle: row.title,
          metaSlug: null,
          metaDescription: row.description,
          description: row.description,
          imageUrl,
          recipeCategoriesId: row.categoryId,
          recipeDifficultyId: row.difficultyIds[0] ?? null,
          recipeSeasonsId: row.seasonIds[0] ?? null,
          isPublished: row.isPublished,
        },
        create: {
          sourceSystem: SOURCE_SYSTEM,
          sourceId: row.source.id,
          title: row.title,
          slug: row.slug,
          metaTitle: row.title,
          metaSlug: null,
          metaDescription: row.description,
          description: row.description,
          imageUrl,
          recipeCategoriesId: row.categoryId,
          recipeDifficultyId: row.difficultyIds[0] ?? null,
          recipeSeasonsId: row.seasonIds[0] ?? null,
          isPublished: row.isPublished,
        },
      });

      await target.$transaction(async (transaction) => {
        await Promise.all([
          transaction.recipeIngredients.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeMethods.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeCookingTime.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeCookingMethod.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeCuisines.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeAllergies.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeMealTime.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeNutrient.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeDietType.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeRecipeType.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeSeasonAssignment.deleteMany({ where: { recipeId: recipe.id } }),
          transaction.recipeDifficultyAssignment.deleteMany({ where: { recipeId: recipe.id } }),
        ]);

        const ingredients = row.ingredients.flatMap((ingredient, index) => {
          const formId = formMap.get(ingredient.sourceFormId);
          const unitId = unitMap.get(ingredient.sourceUnitId);

          if (!formId || !unitId) {
            return [];
          }

          return [{
            recipeId: recipe.id,
            ingredientId: ingredient.ingredient.id,
            formId,
            unitId,
            quantity: ingredient.quantity,
            position: index + 1,
          }];
        });

        if (ingredients.length > 0) {
          await transaction.recipeIngredients.createMany({ data: ingredients });
        }
        if (row.steps.length > 0) {
          await transaction.recipeMethods.createMany({
            data: row.steps.map((description, index) => ({
              recipeId: recipe.id,
              title: `Step ${index + 1}`,
              description,
              position: index + 1,
              isPublished: row.isPublished,
            })),
          });
        }
        await transaction.recipeCookingTime.create({
          data: { recipeId: recipe.id, prepTime: row.prepTime, cookTime: 0, restTime: 0 },
        });
        if (row.cookingMethodIds.length > 0) {
          await transaction.recipeCookingMethod.createMany({
            data: row.cookingMethodIds.map((cookingMethodId) => ({
              recipeId: recipe.id,
              cookingMethodId,
            })),
          });
        }
        if (row.cuisineIds.length > 0) {
          await transaction.recipeCuisines.createMany({
            data: row.cuisineIds.map((cuisineId) => ({ recipeId: recipe.id, cuisineId })),
          });
        }
        if (row.allergyIds.length > 0) {
          await transaction.recipeAllergies.createMany({
            data: row.allergyIds.map((allergyId) => ({ recipeId: recipe.id, allergyId })),
          });
        }
        if (row.mealTimeIds.length > 0) {
          await transaction.recipeMealTime.createMany({
            data: row.mealTimeIds.map((mealTimeId) => ({ recipeId: recipe.id, mealTimeId })),
          });
        }
        if (row.nutrientIds.length > 0) {
          await transaction.recipeNutrient.createMany({
            data: row.nutrientIds.map((nutrientId) => ({ recipeId: recipe.id, nutrientId })),
          });
        }
        if (row.dietTypeId) {
          await transaction.recipeDietType.create({
            data: { recipeId: recipe.id, dietTypeId: row.dietTypeId },
          });
        }
        if (row.recipeTypeId) {
          await transaction.recipeRecipeType.create({
            data: { recipeId: recipe.id, recipeTypeId: row.recipeTypeId },
          });
        }
        if (row.seasonIds.length > 0) {
          await transaction.recipeSeasonAssignment.createMany({
            data: row.seasonIds.map((recipeSeasonsId) => ({ recipeId: recipe.id, recipeSeasonsId })),
          });
        }
        if (row.difficultyIds.length > 0) {
          await transaction.recipeDifficultyAssignment.createMany({
            data: row.difficultyIds.map((recipeDifficultyId) => ({
              recipeId: recipe.id,
              recipeDifficultyId,
            })),
          });
        }
      });
    }

    console.log(`Imported recipes: ${prepared.length}`);
    console.log(`Published recipes: ${safelyPublishable}`);
    console.log(`Uploaded recipe-specific image matches: ${actualImages}`);
    console.log(`Post-write mapping issues: ${JSON.stringify(unresolved)}`);
    console.log(`Intentional fallbacks/omissions: ${JSON.stringify(intentionalFallbacks)}`);
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
}

main().catch((error) => {
  console.error("[RECIPE_IMPORT]", error);
  process.exitCode = 1;
});
