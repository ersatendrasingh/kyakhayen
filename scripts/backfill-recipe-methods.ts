import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import {
  generateRecipeMethods,
  type RecipeMethodRecord,
} from "../lib/recipe-method-content";

loadEnvConfig(process.cwd());

const db = new PrismaClient();
const shouldApply = process.argv.includes("--apply");
const auditChanged = process.argv.includes("--audit-changed");
const sampleSlugs = process.argv
  .filter((argument) => argument.startsWith("--sample="))
  .flatMap((argument) => argument.slice("--sample=".length).split(","))
  .filter(Boolean);

async function recipeRows(): Promise<RecipeMethodRecord[]> {
  const rows = await db.recipes.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      RecipeCategories: { select: { name: true, slug: true } },
      recipeCookingMethods: {
        select: { cookingMethod: { select: { title: true, slug: true } } },
      },
      recipeRecipeType: {
        select: { recipeType: { select: { title: true, slug: true } } },
      },
      recipeIngredients: {
        orderBy: { position: "asc" },
        select: { ingredient: { select: { name: true } } },
      },
      recipeMethods: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          isPublished: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    isPublished: row.isPublished,
    category: row.RecipeCategories
      ? { title: row.RecipeCategories.name, slug: row.RecipeCategories.slug }
      : null,
    cookingMethods: row.recipeCookingMethods.map(({ cookingMethod }) => cookingMethod),
    recipeTypes: row.recipeRecipeType.map(({ recipeType }) => recipeType),
    ingredients: row.recipeIngredients.map(({ ingredient }) => ingredient.name),
    currentMethods: row.recipeMethods,
  }));
}

async function main() {
  const recipes = await recipeRows();
  const generated = recipes.map((recipe) => ({
    recipe,
    methods: generateRecipeMethods(recipe),
  }));
  const recipesWithoutCurrentSteps = generated.filter(
    ({ recipe }) => recipe.currentMethods.length === 0,
  );
  const totalGeneratedSteps = generated.reduce((total, row) => total + row.methods.length, 0);
  const missingDescriptions = generated.flatMap(({ methods }) =>
    methods.filter((method) => !method.description || method.description.length < 30),
  );
  const genericStepTitles = generated.flatMap(({ methods }) =>
    methods.filter((method) => /^(?:step\s+\d+|complete cooking step\s+\d+)$/i.test(method.title)),
  );
  const notSimpleEnglish = generated.flatMap(({ methods }) =>
    methods.filter((method) => /[\u0900-\u097F]/.test(method.description)),
  );
  const changedExistingMethods = generated.flatMap(({ recipe, methods }) =>
    methods.filter((method) => {
      if (!method.existingId) return false;
      const current = recipe.currentMethods.find((existing) => existing.id === method.existingId);
      return (
        current?.title !== method.title ||
        current?.description !== method.description ||
        current?.position !== method.position ||
        current?.isPublished !== method.isPublished
      );
    }),
  );

  console.log(`Recipes audited for cooking methods: ${recipes.length}`);
  console.log(`Existing recipes without steps: ${recipesWithoutCurrentSteps.length}`);
  console.log(`Existing method rows requiring humanized updates: ${changedExistingMethods.length}`);
  console.log(`New method rows prepared for step-less recipes: ${recipesWithoutCurrentSteps.reduce((total, row) => total + row.methods.length, 0)}`);
  console.log(`Total method rows after backfill: ${totalGeneratedSteps}`);
  console.log(`Generated steps with short or missing descriptions: ${missingDescriptions.length}`);
  console.log(`Generated steps retaining generic Step N titles: ${genericStepTitles.length}`);
  console.log(`Generated steps containing Devanagari text: ${notSimpleEnglish.length}`);

  if (auditChanged && changedExistingMethods.length > 0) {
    generated
      .flatMap(({ recipe, methods }) =>
        methods.flatMap((method) => {
          if (!method.existingId) return [];
          const current = recipe.currentMethods.find((existing) => existing.id === method.existingId);
          if (
            current?.title === method.title &&
            current?.description === method.description &&
            current?.position === method.position &&
            current?.isPublished === method.isPublished
          ) {
            return [];
          }
          return [{ recipe, current, method }];
        }),
      )
      .slice(0, 20)
      .forEach(({ recipe, current, method }) => {
        console.log(`\nCHANGED SAMPLE: ${recipe.title} [${recipe.slug}] #${method.position}`);
        console.log(`CURRENT: ${current?.description ?? ""}`);
        console.log(`NEXT:    ${method.description}`);
      });
  }

  if (missingDescriptions.length || genericStepTitles.length || notSimpleEnglish.length) {
    generated
      .flatMap(({ recipe, methods }) =>
        methods
          .filter(
            (method) =>
              method.description.length < 30 ||
              /^(?:step\s+\d+|complete cooking step\s+\d+)$/i.test(method.title),
          )
          .map((method) => ({ recipe, method })),
      )
      .slice(0, 30)
      .forEach(({ recipe, method }) => {
        console.log(
          `QUALITY SAMPLE: ${recipe.title} [${recipe.slug}] #${method.position} ${method.title} ${method.description}`,
        );
      });
    throw new Error("Method quality checks failed. Review the generated instructions before applying.");
  }

  for (const slug of sampleSlugs) {
    const sample = generated.find(({ recipe }) => recipe.slug === slug);
    if (!sample) {
      console.warn(`Sample recipe not found: ${slug}`);
      continue;
    }
    console.log(`\n--- SAMPLE: ${sample.recipe.title} [${sample.recipe.slug}] ---`);
    sample.methods.forEach((method) => {
      console.log(`${method.position}. ${method.title}`);
      console.log(method.description);
    });
  }

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply to write cooking methods.");
    return;
  }

  const existingUpdates = generated.flatMap(({ recipe, methods }) =>
    methods.flatMap((method) => {
      if (!method.existingId) return [];
      const current = recipe.currentMethods.find((existing) => existing.id === method.existingId);
      if (
        current?.title === method.title &&
        current?.description === method.description &&
        current?.position === method.position &&
        current?.isPublished === method.isPublished
      ) {
        return [];
      }
      return [method];
    }),
  );

  const batchSize = 100;
  for (let index = 0; index < existingUpdates.length; index += batchSize) {
    const batch = existingUpdates.slice(index, index + batchSize);
    await db.$transaction(
      batch.map((method) =>
        db.recipeMethods.update({
          where: { id: method.existingId as string },
          data: {
            title: method.title,
            description: method.description,
            position: method.position,
            isPublished: method.isPublished,
          },
        }),
      ),
    );
    console.log(`Updated ${Math.min(index + batch.length, existingUpdates.length)}/${existingUpdates.length} existing steps.`);
  }

  for (const { recipe, methods } of recipesWithoutCurrentSteps) {
    await db.recipeMethods.createMany({
      data: methods.map((method) => ({
        recipeId: recipe.id,
        title: method.title,
        description: method.description,
        position: method.position,
        isPublished: method.isPublished,
      })),
    });
  }
  console.log(`Created methods for ${recipesWithoutCurrentSteps.length} recipes that had no steps.`);
  console.log("Recipe cooking-method backfill complete.");
}

main()
  .catch((error) => {
    console.error("Recipe cooking-method backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
