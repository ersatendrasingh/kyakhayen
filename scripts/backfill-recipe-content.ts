import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import {
  findRelatedContentLinks,
  generateRecipeContent,
  type RecipeContentRecord,
} from "../lib/recipe-content";

loadEnvConfig(process.cwd());

const db = new PrismaClient();
const shouldApply = process.argv.includes("--apply");
const imagesOnly = process.argv.includes("--images-only");
const refreshGenerated = process.argv.includes("--refresh-generated");
const sampleSlugs = process.argv
  .filter((arg) => arg.startsWith("--sample="))
  .flatMap((arg) => arg.slice("--sample=".length).split(","))
  .filter(Boolean);

type StoredRecipeContentRecord = RecipeContentRecord & {
  hasRealImage: boolean;
  currentDescription: string | null;
  currentMetaTitle: string | null;
  currentMetaDescription: string | null;
};

async function recipeRows(): Promise<StoredRecipeContentRecord[]> {
  const rows = await db.recipes.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      imageUrl: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      RecipeCategories: { select: { name: true, slug: true } },
      recipeCuisine: { select: { cuisine: { select: { title: true, slug: true } } } },
      recipeMealTime: { select: { mealTime: { select: { title: true, slug: true } } } },
      recipeDietType: { select: { dietType: { select: { title: true, slug: true } } } },
      recipeRecipeType: { select: { recipeType: { select: { title: true, slug: true } } } },
      recipeCookingMethods: { select: { cookingMethod: { select: { title: true, slug: true } } } },
      recipeIngredients: {
        orderBy: { position: "asc" },
        select: { ingredient: { select: { name: true } } },
      },
      recipeMethods: {
        orderBy: { position: "asc" },
        select: { description: true },
      },
      recipeCookingTime: { select: { prepTime: true, cookTime: true, restTime: true } },
    },
    orderBy: { title: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    isPublished: row.isPublished,
    hasRealImage: Boolean(row.imageUrl && !row.imageUrl.includes("/recipes/default/default-recipe.png")),
    currentDescription: row.description,
    currentMetaTitle: row.metaTitle,
    currentMetaDescription: row.metaDescription,
    category: row.RecipeCategories
      ? { title: row.RecipeCategories.name, slug: row.RecipeCategories.slug }
      : null,
    cuisines: row.recipeCuisine.map(({ cuisine }) => cuisine),
    mealTimes: row.recipeMealTime.map(({ mealTime }) => mealTime),
    dietTypes: row.recipeDietType.map(({ dietType }) => dietType),
    recipeTypes: row.recipeRecipeType.map(({ recipeType }) => recipeType),
    cookingMethods: row.recipeCookingMethods.map(({ cookingMethod }) => cookingMethod),
    ingredients: row.recipeIngredients.map(({ ingredient }) => ingredient.name),
    steps: row.recipeMethods.flatMap((method) => method.description ? [method.description] : []),
    prepTime: row.recipeCookingTime?.prepTime ?? 0,
    cookTime: row.recipeCookingTime?.cookTime ?? 0,
    restTime: row.recipeCookingTime?.restTime ?? 0,
  }));
}

async function main() {
  const rows = await recipeRows();
  const selectedRows = imagesOnly ? rows.filter((recipe) => recipe.hasRealImage) : rows;
  const generated = selectedRows.map((recipe) => {
    const related = findRelatedContentLinks(recipe, rows);
    return {
      recipe,
      related,
      content: generateRecipeContent(recipe, related),
    };
  });
  const wordCounts = generated.map((row) => row.content.wordCount);
  const internalLinkCount = generated.reduce((count, row) => count + row.related.length, 0);
  const withoutLinks = generated.filter((row) => row.related.length === 0);
  const underMinimum = generated.filter((row) => row.content.wordCount < 300);
  const preservedRichContent = generated.filter((row) =>
    /<(?:h2|h3|ul|blockquote)\b/i.test(row.recipe.currentDescription ?? "") &&
    !(
      refreshGenerated &&
      (row.recipe.currentDescription ?? "").includes(
        "tags on Kya Khayen help with discovery and everyday preference-based planning"
      )
    )
  );
  const changed = generated.filter(
    (row) =>
      !preservedRichContent.includes(row) &&
      (row.recipe.currentDescription !== row.content.description ||
        row.recipe.currentMetaTitle !== row.content.metaTitle ||
        row.recipe.currentMetaDescription !== row.content.metaDescription)
  );

  console.log(`Content scope: ${imagesOnly ? "recipes with real images only" : "all recipes"}`);
  console.log(`Generated content refresh: ${refreshGenerated ? "enabled" : "disabled"}`);
  console.log(`Recipes prepared for rich content: ${generated.length}`);
  console.log(`Existing rich recipe descriptions preserved: ${preservedRichContent.length}`);
  console.log(`Recipes requiring rich-content updates: ${changed.length}`);
  console.log(`Published internal-link targets available: ${rows.filter((row) => row.isPublished).length}`);
  console.log(`Internal recipe links prepared: ${internalLinkCount}`);
  console.log(`Recipes without internal links: ${withoutLinks.length}`);
  console.log(`Content word range: ${Math.min(...wordCounts)}-${Math.max(...wordCounts)}`);

  if (underMinimum.length > 0) {
    throw new Error(`${underMinimum.length} recipe descriptions are below the 300-word quality floor.`);
  }

  if (sampleSlugs.length > 0) {
    for (const slug of sampleSlugs) {
      const sample = generated.find((row) => row.recipe.slug === slug);
      if (!sample) {
        console.warn(`Sample recipe not found: ${slug}`);
        continue;
      }
      console.log(`\n--- SAMPLE: ${sample.recipe.title} [${sample.recipe.slug}] (${sample.content.wordCount} words) ---`);
      console.log(sample.content.description);
      console.log(`META TITLE: ${sample.content.metaTitle}`);
      console.log(`META DESCRIPTION: ${sample.content.metaDescription}`);
    }
  }

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply to write rich recipe content.");
    return;
  }

  const batchSize = 100;
  for (let index = 0; index < changed.length; index += batchSize) {
    const batch = changed.slice(index, index + batchSize);
    await db.$transaction(
      batch.map((row) =>
        db.recipes.update({
          where: { id: row.recipe.id },
          data: {
            description: row.content.description,
            metaTitle: row.content.metaTitle,
            metaDescription: row.content.metaDescription,
          },
        })
      )
    );
    console.log(`Written ${Math.min(index + batch.length, changed.length)}/${changed.length} recipes.`);
  }

  console.log("Recipe rich-content backfill complete.");
}

main()
  .catch((error) => {
    console.error("Recipe rich-content backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
