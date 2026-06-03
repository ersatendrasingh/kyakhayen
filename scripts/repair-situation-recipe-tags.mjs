import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const breakfastBlockedTypeSlugs = new Set([
  "cooked-vegetable",
  "vegetable-salad",
  "soup",
  "chutneydips",
  "curdraita",
  "desserts",
  "beveragesmoothie",
  "drink-teas",
  "drink-infusions",
  "drink-juices",
  "drink-coolers-sharbat",
  "drink-smoothies",
  "drink-shakes",
  "drink-lassi-buttermilk",
  "drink-detox",
  "drink-hot-sips",
  "morning-hydration",
  "fruits",
  "fruit-salad",
]);

const utilityTypeSlugs = new Set([
  "beveragesmoothie",
  "drink-teas",
  "drink-infusions",
  "drink-juices",
  "drink-coolers-sharbat",
  "drink-smoothies",
  "drink-shakes",
  "drink-lassi-buttermilk",
  "drink-detox",
  "drink-hot-sips",
  "morning-hydration",
  "fruits",
  "fruit-salad",
]);

const mainMealSlugs = new Set(["breakfast", "lunch", "dinner"]);

function hasAny(set, values) {
  return values.some((value) => set.has(value));
}

function slugSet(items, getSlug) {
  return new Set(items.map((item) => getSlug(item)).filter(Boolean));
}

function compactRecipe(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    mealTimes: recipe.recipeMealTime.map((item) => item.mealTime.slug),
    recipeTypes: recipe.recipeRecipeType.map((item) => item.recipeType.slug),
  };
}

async function main() {
  const recipes = await db.recipes.findMany({
    where: {
      recipeMealTime: {
        some: {
          mealTime: {
            slug: { in: Array.from(mainMealSlugs) },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      recipeMealTime: {
        select: {
          id: true,
          mealTime: { select: { slug: true } },
        },
      },
      recipeRecipeType: {
        select: {
          recipeType: { select: { slug: true } },
        },
      },
    },
  });

  const removeRelationIds = new Set();
  const breakfastFixes = [];
  const allDayMainBreakfastFixes = [];
  const utilityMealFixes = [];

  for (const recipe of recipes) {
    const typeSlugs = slugSet(
      recipe.recipeRecipeType,
      (item) => item.recipeType.slug,
    );
    const isBreakfastBlocked = Array.from(typeSlugs).some((slug) =>
      breakfastBlockedTypeSlugs.has(slug),
    );
    const isUtilityRecipe = Array.from(typeSlugs).some((slug) =>
      utilityTypeSlugs.has(slug),
    );

    if (isBreakfastBlocked) {
      const breakfastLinks = recipe.recipeMealTime.filter(
        (item) => item.mealTime.slug === "breakfast",
      );

      if (breakfastLinks.length > 0) {
        breakfastFixes.push(compactRecipe(recipe));
        breakfastLinks.forEach((item) => removeRelationIds.add(item.id));
      }
    }

    const mealSlugs = slugSet(recipe.recipeMealTime, (item) => item.mealTime.slug);
    const isAllDayMain =
      mealSlugs.has("breakfast") &&
      mealSlugs.has("lunch") &&
      mealSlugs.has("dinner") &&
      !typeSlugs.has("snacks") &&
      hasAny(typeSlugs, ["meal", "cooked-vegetable"]) &&
      hasAny(typeSlugs, ["grains", "cooked-vegetable"]);

    if (isAllDayMain) {
      const breakfastLinks = recipe.recipeMealTime.filter(
        (item) => item.mealTime.slug === "breakfast",
      );

      if (breakfastLinks.length > 0) {
        allDayMainBreakfastFixes.push(compactRecipe(recipe));
        breakfastLinks.forEach((item) => removeRelationIds.add(item.id));
      }
    }

    if (isUtilityRecipe) {
      const utilityMainLinks = recipe.recipeMealTime.filter((item) =>
        mainMealSlugs.has(item.mealTime.slug),
      );

      if (utilityMainLinks.length > 0) {
        utilityMealFixes.push(compactRecipe(recipe));
        utilityMainLinks.forEach((item) => removeRelationIds.add(item.id));
      }
    }
  }

  const duplicateLinks = await db.recipeMealTime.groupBy({
    by: ["recipeId", "mealTimeId"],
    _count: { id: true },
    having: { id: { _count: { gt: 1 } } },
  });
  const duplicateRelationIds = [];

  for (const duplicate of duplicateLinks) {
    const links = await db.recipeMealTime.findMany({
      where: {
        recipeId: duplicate.recipeId,
        mealTimeId: duplicate.mealTimeId,
      },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    duplicateRelationIds.push(...links.slice(1).map((link) => link.id));
  }

  duplicateRelationIds.forEach((id) => removeRelationIds.add(id));

  const relationIds = Array.from(removeRelationIds);

  if (apply && relationIds.length > 0) {
    await db.recipeMealTime.deleteMany({
      where: { id: { in: relationIds } },
    });
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        removedMealTimeLinks: apply ? relationIds.length : 0,
        wouldRemoveMealTimeLinks: relationIds.length,
        breakfastFixes: breakfastFixes.length,
        allDayMainBreakfastFixes: allDayMainBreakfastFixes.length,
        utilityMealFixes: utilityMealFixes.length,
        duplicateMealTimeLinks: duplicateRelationIds.length,
        sampleBreakfastFixes: breakfastFixes.slice(0, 12),
        sampleAllDayMainBreakfastFixes: allDayMainBreakfastFixes.slice(0, 12),
        sampleUtilityMealFixes: utilityMealFixes.slice(0, 12),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("[repair-situation-recipe-tags]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
