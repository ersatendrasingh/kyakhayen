import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import { buildRecipeSeoPlan } from "../lib/recipe-seo";

loadEnvConfig(process.cwd());

const shouldApply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const recipes = await db.recipes.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      RecipeCategories: { select: { slug: true } },
      recipeCuisine: { select: { cuisine: { select: { slug: true } } } },
      recipeDietType: { select: { dietType: { select: { slug: true } } } },
      recipeMealTime: { select: { mealTime: { select: { slug: true } } } },
      recipeCookingMethods: { select: { cookingMethod: { select: { slug: true } } } },
      recipeRecipeType: { select: { recipeType: { select: { slug: true } } } },
      recipeIngredients: { select: { ingredient: { select: { slug: true } } } },
    },
    orderBy: { title: "asc" },
  });

  const plan = buildRecipeSeoPlan(
    recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      keywords: [
        ...recipe.recipeCuisine.map(({ cuisine }) => cuisine.slug),
        ...recipe.recipeDietType.map(({ dietType }) => dietType.slug),
        ...recipe.recipeMealTime.map(({ mealTime }) => mealTime.slug),
        ...recipe.recipeCookingMethods.map(({ cookingMethod }) => cookingMethod.slug),
        ...recipe.recipeRecipeType.map(({ recipeType }) => recipeType.slug),
        recipe.RecipeCategories?.slug,
        ...recipe.recipeIngredients.map(({ ingredient }) => ingredient.slug),
      ].filter((keyword): keyword is string => Boolean(keyword)),
    }))
  );
  const changes = plan.updates.filter(
    (recipe) => recipe.title !== recipe.previousTitle || recipe.slug !== recipe.previousSlug
  );
  const numericSuffixSlugs = plan.updates.filter((recipe) => /-\d+$/.test(recipe.slug));

  console.log(`Recipes inspected: ${recipes.length}`);
  console.log(`Recipes requiring title or slug updates: ${changes.length}`);
  console.log(`Suspected numeric fallback slugs after plan: ${numericSuffixSlugs.length}`);
  numericSuffixSlugs.forEach((recipe) => console.log(`Review numeric suffix: ${recipe.slug}`));
  changes.forEach((recipe) => {
    console.log(
      `${recipe.previousTitle} [${recipe.previousSlug}] -> ${recipe.title} [${recipe.slug}]`
    );
  });

  if (plan.unresolved.length > 0) {
    plan.unresolved.forEach((issue) => console.error(`Unresolved: ${issue}`));
    throw new Error("SEO slug plan requires editorial keywords before it can be applied.");
  }

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply after reviewing these recipe identity changes.");
    return;
  }

  await db.$transaction(async (transaction) => {
    for (const recipe of changes) {
      await transaction.recipes.update({
        where: { id: recipe.id },
        data: { slug: `seo-transition-${recipe.id}` },
      });
    }

    for (const recipe of changes) {
      await transaction.recipes.update({
        where: { id: recipe.id },
        data: {
          title: recipe.title,
          slug: recipe.slug,
        },
      });
    }
  });

  console.log(`Applied SEO identity updates to ${changes.length} recipes.`);
}

main()
  .catch((error) => {
    console.error("Recipe SEO backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
