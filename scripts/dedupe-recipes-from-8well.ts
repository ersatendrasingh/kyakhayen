import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import { SOURCE_RECIPE_DUPLICATE_CLUSTERS } from "../lib/recipe-duplicates";

loadEnvConfig(process.cwd());

const SOURCE_SYSTEM = "8well";
const DEFAULT_IMAGE_KEY = "/recipes/default/default-recipe.png";
const shouldApply = process.argv.includes("--apply");
const db = new PrismaClient();

type CandidateRecipe = Awaited<ReturnType<typeof candidateRows>>[number];

function candidateRows() {
  const sourceIds = SOURCE_RECIPE_DUPLICATE_CLUSTERS.flatMap((cluster) => [
    cluster.canonicalSourceId,
    ...cluster.duplicateSourceIds,
  ]);

  return db.recipes.findMany({
    where: { sourceSystem: SOURCE_SYSTEM, sourceId: { in: sourceIds } },
    select: {
      id: true,
      sourceId: true,
      title: true,
      slug: true,
      imageUrl: true,
      isPublished: true,
      views: true,
      recipeCategoriesId: true,
      recipeDifficultyId: true,
      recipeSeasonsId: true,
      recipeIngredients: {
        orderBy: { position: "asc" },
        select: { ingredientId: true, quantity: true, formId: true, unitId: true, position: true },
      },
      recipeMethods: {
        orderBy: { position: "asc" },
        select: {
          title: true,
          description: true,
          imageUrl: true,
          videoUrl: true,
          notes: true,
          position: true,
          isPublished: true,
        },
      },
      recipeCookingTime: { select: { prepTime: true, cookTime: true, restTime: true } },
      recipeCookingMethods: { select: { cookingMethodId: true } },
      recipeCuisine: { select: { cuisineId: true } },
      recipeAllergies: { select: { allergyId: true } },
      recipeMealTime: { select: { mealTimeId: true } },
      recipeNutrient: { select: { nutrientId: true } },
      recipeDietType: { select: { dietTypeId: true } },
      recipeRecipeType: { select: { recipeTypeId: true } },
      recipeSeasonTags: { select: { recipeSeasonsId: true } },
      recipeDifficulties: { select: { recipeDifficultyId: true } },
      recipeBodyTypes: { select: { bodyTypeId: true } },
      RecipeViews: { select: { ipAddress: true } },
      Favorite: { select: { userId: true } },
      _count: {
        select: {
          recipeComments: true,
          Review: true,
          RecipeViews: true,
          UserRecipeViews: true,
          Favorite: true,
          RecipeReaction: true,
        },
      },
    },
  });
}

function sortedIds<T extends Record<string, string>>(rows: T[], key: keyof T) {
  return rows.map((row) => row[key]).sort();
}

function structureFingerprint(recipe: CandidateRecipe) {
  return JSON.stringify({
    recipeCategoriesId: recipe.recipeCategoriesId,
    recipeDifficultyId: recipe.recipeDifficultyId,
    recipeSeasonsId: recipe.recipeSeasonsId,
    ingredients: recipe.recipeIngredients,
    methods: recipe.recipeMethods.map((method) => ({
      title: method.title,
      description: method.description,
      imageUrl: method.imageUrl,
      videoUrl: method.videoUrl,
      notes: method.notes,
      position: method.position,
    })),
    cookingTime: recipe.recipeCookingTime,
    cookingMethods: sortedIds(recipe.recipeCookingMethods, "cookingMethodId"),
    cuisines: sortedIds(recipe.recipeCuisine, "cuisineId"),
    allergies: sortedIds(recipe.recipeAllergies, "allergyId"),
    mealTimes: sortedIds(recipe.recipeMealTime, "mealTimeId"),
    nutrients: sortedIds(recipe.recipeNutrient, "nutrientId"),
    dietTypes: sortedIds(recipe.recipeDietType, "dietTypeId"),
    recipeTypes: sortedIds(recipe.recipeRecipeType, "recipeTypeId"),
    seasons: sortedIds(recipe.recipeSeasonTags, "recipeSeasonsId"),
    difficulties: sortedIds(recipe.recipeDifficulties, "recipeDifficultyId"),
  });
}

function nonMigratableActivity(recipe: CandidateRecipe) {
  return (
    recipe._count.recipeComments +
    recipe._count.Review +
    recipe._count.UserRecipeViews +
    recipe._count.RecipeReaction
  );
}

function hasRealImage(recipe: CandidateRecipe) {
  return Boolean(recipe.imageUrl && !recipe.imageUrl.includes(DEFAULT_IMAGE_KEY));
}

async function main() {
  const rows = await candidateRows();
  const errors: string[] = [];
  const deleteIds: string[] = [];
  const deleteSourceIds: number[] = [];
  const migrations: {
    canonical: CandidateRecipe;
    duplicate: CandidateRecipe;
    promoteMedia: boolean;
    addBodyTypeIds: string[];
  }[] = [];

  console.log(`Reviewed source duplicate clusters: ${SOURCE_RECIPE_DUPLICATE_CLUSTERS.length}`);

  for (const cluster of SOURCE_RECIPE_DUPLICATE_CLUSTERS) {
    const canonical = rows.find((row) => row.sourceId === cluster.canonicalSourceId);
    const duplicates = cluster.duplicateSourceIds.flatMap((sourceId) => {
      const row = rows.find((candidate) => candidate.sourceId === sourceId);
      return row ? [row] : [];
    });
    const missingDuplicates = cluster.duplicateSourceIds.filter(
      (sourceId) => !rows.some((row) => row.sourceId === sourceId)
    );

    if (!canonical) {
      errors.push(`Canonical source ${cluster.canonicalSourceId} is missing for ${cluster.canonicalTitle}.`);
      continue;
    }

    if (missingDuplicates.length > 0) {
      console.log(
        `${cluster.canonicalTitle}: already clean for source IDs ${missingDuplicates.join(", ")}.`
      );
    }

    for (const duplicate of duplicates) {
      const sameStructure = structureFingerprint(canonical) === structureFingerprint(duplicate);
      const promoteMedia = hasRealImage(duplicate) && !hasRealImage(canonical);
      const safeMedia =
        (!hasRealImage(duplicate) && !duplicate.isPublished) ||
        (promoteMedia && duplicate.isPublished && !canonical.isPublished) ||
        (duplicate.imageUrl === canonical.imageUrl && duplicate.isPublished === canonical.isPublished);
      const otherActivity = nonMigratableActivity(duplicate);
      const conflictingViewIps = duplicate.RecipeViews.filter((view) =>
        canonical.RecipeViews.some((canonicalView) => canonicalView.ipAddress === view.ipAddress)
      );
      const conflictingFavoriteUsers = duplicate.Favorite.filter((favorite) =>
        canonical.Favorite.some((canonicalFavorite) => canonicalFavorite.userId === favorite.userId)
      );
      const canonicalBodyTypeIds = new Set(canonical.recipeBodyTypes.map((row) => row.bodyTypeId));
      const addBodyTypeIds = duplicate.recipeBodyTypes
        .map((row) => row.bodyTypeId)
        .filter((bodyTypeId) => !canonicalBodyTypeIds.has(bodyTypeId));

      console.log(
        `${cluster.canonicalTitle}: keep ${canonical.sourceId} [${canonical.slug}], remove ${duplicate.sourceId} [${duplicate.slug}], structuralMatch=${sameStructure}, mediaAction=${promoteMedia ? "promote-to-canonical" : "keep-canonical"}, migrateViews=${duplicate.RecipeViews.length}, migrateFavorites=${duplicate.Favorite.length}, addBodyTypes=${addBodyTypeIds.length}, blockedActivity=${otherActivity}`
      );

      if (!sameStructure) {
        errors.push(`Source ${duplicate.sourceId} no longer structurally matches canonical ${canonical.sourceId}.`);
      }
      if (!safeMedia) {
        errors.push(`Source ${duplicate.sourceId} has media state that cannot be preserved automatically.`);
      }
      if (otherActivity > 0) {
        errors.push(`Source ${duplicate.sourceId} has ${otherActivity} non-view user activity records.`);
      }
      if (conflictingViewIps.length > 0) {
        errors.push(`Source ${duplicate.sourceId} has view IP records already present on canonical recipe.`);
      }
      if (conflictingFavoriteUsers.length > 0) {
        errors.push(`Source ${duplicate.sourceId} has favourites already present on canonical recipe.`);
      }

      if (
        sameStructure &&
        safeMedia &&
        otherActivity === 0 &&
        conflictingViewIps.length === 0 &&
        conflictingFavoriteUsers.length === 0
      ) {
        deleteIds.push(duplicate.id);
        deleteSourceIds.push(duplicate.sourceId as number);
        migrations.push({ canonical, duplicate, promoteMedia, addBodyTypeIds });
      }
    }
  }

  console.log(`Verified redundant target rows ready to delete: ${deleteIds.length}`);
  console.log(`Target source IDs ready to delete: ${deleteSourceIds.join(", ") || "none"}`);

  if (errors.length > 0) {
    errors.forEach((error) => console.error(`Blocked: ${error}`));
    throw new Error("Duplicate cleanup validation failed; no rows were deleted.");
  }

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply after reviewing this duplicate deletion set.");
    return;
  }

  const deletedCount = await db.$transaction(async (transaction) => {
    for (const migration of migrations) {
      if (migration.promoteMedia) {
        await transaction.recipes.update({
          where: { id: migration.canonical.id },
          data: { imageUrl: migration.duplicate.imageUrl, isPublished: true },
        });
        await transaction.recipeMethods.updateMany({
          where: { recipeId: migration.canonical.id },
          data: { isPublished: true },
        });
      }

      if (migration.addBodyTypeIds.length > 0) {
        await transaction.recipeBodyType.createMany({
          data: migration.addBodyTypeIds.map((bodyTypeId) => ({
            recipeId: migration.canonical.id,
            bodyTypeId,
          })),
          skipDuplicates: true,
        });
      }

      if (migration.duplicate.RecipeViews.length > 0) {
        await transaction.recipeViews.updateMany({
          where: { recipeId: migration.duplicate.id },
          data: { recipeId: migration.canonical.id },
        });
      }

      if (migration.duplicate.Favorite.length > 0) {
        await transaction.favorite.updateMany({
          where: { recipeId: migration.duplicate.id },
          data: { recipeId: migration.canonical.id },
        });
      }
    }

    const result = await transaction.recipes.deleteMany({ where: { id: { in: deleteIds } } });
    return result.count;
  });

  console.log(`Deleted verified duplicate recipes: ${deletedCount}`);
}

main()
  .catch((error) => {
    console.error("Recipe duplicate cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
