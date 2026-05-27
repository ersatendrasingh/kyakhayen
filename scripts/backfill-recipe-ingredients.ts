import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

type SourceRecipe = {
  id: number;
  name: string;
  ingrs_list: string | null;
};

type SourceIngredientEntry = {
  sourceIngredientId: number;
  sourceFormId: number;
  quantity: number;
  sourceUnitId: number;
  sourcePosition: number;
};

type ExpectedIngredient = {
  ingredientId: string;
  formId: string;
  unitId: string;
  quantity: number;
  position: number;
  label: string;
};

type EditorialIngredient = {
  slug: string;
  form: string;
  unit: string;
  quantity: number;
};

const SOURCE_SYSTEM = "8well";
const SOURCE_DATABASE_NAME = "8well";
const shouldApply = process.argv.includes("--apply");
const sampleSlugs = process.argv
  .filter((argument) => argument.startsWith("--sample="))
  .flatMap((argument) => argument.slice("--sample=".length).split(","))
  .filter(Boolean);

const EDITORIAL_INGREDIENTS: Record<string, EditorialIngredient[]> = {
  "aloo-gobhi": [
    { slug: "potato-brown-skin-big", form: "Raw", unit: "g", quantity: 150 },
    { slug: "cauliflower-raw", form: "Raw", unit: "g", quantity: 150 },
    { slug: "sunflower-oil", form: "Raw", unit: "tsp", quantity: 1 },
    { slug: "cumin-seeds", form: "Raw", unit: "tsp", quantity: 0.5 },
    { slug: "turmeric-powder", form: "Powdered", unit: "tsp", quantity: 0.25 },
    { slug: "spices-chili-powder", form: "Powdered", unit: "tsp", quantity: 0.5 },
    { slug: "coriander-powder", form: "Powdered", unit: "tsp", quantity: 1 },
    { slug: "salt-table", form: "Unspecified", unit: "to-taste", quantity: 1 },
  ],
  "bajra-roti": [
    { slug: "bajra", form: "Flour", unit: "g", quantity: 60 },
    { slug: "water-tap-drinking", form: "Unspecified", unit: "cup", quantity: 0.25 },
    { slug: "salt-table", form: "Unspecified", unit: "to-taste", quantity: 1 },
  ],
  "carrot-beetroot-juice": [
    { slug: "carrot-orange", form: "Raw", unit: "g", quantity: 100 },
    { slug: "beet-root", form: "Raw", unit: "g", quantity: 75 },
    { slug: "ginger-fresh", form: "Fresh", unit: "g", quantity: 2 },
    { slug: "water-tap-drinking", form: "Unspecified", unit: "cup", quantity: 0.5 },
  ],
  "carrot-soup-with-lentils-and-ginger": [
    { slug: "carrot-orange", form: "Raw", unit: "g", quantity: 150 },
    { slug: "lentils-raw", form: "Raw", unit: "g", quantity: 30 },
    { slug: "ginger-fresh", form: "Grated", unit: "g", quantity: 5 },
    { slug: "soup-vegetable-broth-ready-to-serve", form: "Prepared", unit: "cup", quantity: 1 },
    { slug: "coriander-leaves", form: "Chopped", unit: "g", quantity: 5 },
    { slug: "black-pepper", form: "Powdered", unit: "tsp", quantity: 0.25 },
    { slug: "salt-table", form: "Unspecified", unit: "to-taste", quantity: 1 },
  ],
  "paneer-vegetable-sandwich": [
    { slug: "bread-multi-grain-includes-whole-grain", form: "Raw", unit: "slices", quantity: 2 },
    { slug: "paneer", form: "Raw", unit: "g", quantity: 50 },
    { slug: "cucumber-green-elongate", form: "Sliced", unit: "g", quantity: 30 },
    { slug: "tomato-ripe-local", form: "Sliced", unit: "g", quantity: 30 },
    { slug: "onions-raw", form: "Sliced", unit: "g", quantity: 20 },
    { slug: "capsicum-green", form: "Sliced", unit: "g", quantity: 20 },
    { slug: "black-pepper", form: "Powdered", unit: "tsp", quantity: 0.25 },
    { slug: "salt-table", form: "Unspecified", unit: "to-taste", quantity: 1 },
  ],
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to backfill recipe ingredients.`);
  return value;
}

function sourceDatabaseUrl() {
  if (process.env.SOURCE_8WELL_DATABASE_URL) return process.env.SOURCE_8WELL_DATABASE_URL;
  const url = new URL(requireEnv("DATABASE_URL"));
  url.pathname = `/${SOURCE_DATABASE_NAME}`;
  return url.toString();
}

function cleanTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
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

function parseIngredients(value: string | null) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry, index): SourceIngredientEntry[] => {
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
        sourcePosition: index + 1,
      }];
    });
}

function sourceEntryKey(entry: SourceIngredientEntry) {
  return [
    entry.sourceIngredientId,
    entry.sourceFormId,
    entry.sourceUnitId,
    entry.quantity,
  ].join("|");
}

function dedupeSourceEntries(entries: SourceIngredientEntry[]) {
  const seen = new Set<string>();
  const deduped: SourceIngredientEntry[] = [];
  let removed = 0;

  for (const entry of entries) {
    const key = sourceEntryKey(entry);
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    deduped.push(entry);
  }

  return { deduped, removed };
}

function ingredientSignature(ingredients: ExpectedIngredient[]) {
  return ingredients
    .map((ingredient) =>
      [
        ingredient.ingredientId,
        ingredient.formId,
        ingredient.unitId,
        ingredient.quantity,
        ingredient.position,
      ].join("|"),
    )
    .join(";");
}

async function main() {
  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({ datasources: { db: { url: sourceDatabaseUrl() } } });

  try {
    const [
      recipes,
      sourceRecipes,
      sourceForms,
      sourceUnits,
      targetIngredients,
      targetForms,
      targetUnits,
    ] = await Promise.all([
      targetDb.recipes.findMany({
        where: { sourceSystem: SOURCE_SYSTEM },
        select: {
          id: true,
          title: true,
          slug: true,
          sourceId: true,
          recipeIngredients: {
            orderBy: { position: "asc" },
            select: {
              ingredientId: true,
              formId: true,
              unitId: true,
              quantity: true,
              position: true,
              ingredient: { select: { name: true, slug: true, sourceId: true } },
              ingredientForm: { select: { name: true } },
              unit: { select: { shortName: true } },
            },
          },
        },
        orderBy: { title: "asc" },
      }),
      sourceDb.$queryRawUnsafe<SourceRecipe[]>(
        "SELECT id, name, ingrs_list FROM app_recipes ORDER BY id",
      ),
      sourceDb.$queryRawUnsafe<{ id: number; name: string }[]>(
        "SELECT id, name FROM ingredient_meta_data ORDER BY id",
      ),
      sourceDb.$queryRawUnsafe<{ id: number; short_name: string; diet: number }[]>(
        "SELECT id, short_name, diet FROM units WHERE diet = 1 ORDER BY id",
      ),
      targetDb.ingredients.findMany({
        select: { id: true, name: true, slug: true, sourceId: true },
      }),
      targetDb.ingredientsForm.findMany({ select: { id: true, name: true } }),
      targetDb.units.findMany({ select: { id: true, shortName: true } }),
    ]);

    const sourceById = new Map(sourceRecipes.map((recipe) => [recipe.id, recipe]));
    const ingredientBySourceId = new Map(
      targetIngredients
        .filter((ingredient) => ingredient.sourceId !== null)
        .map((ingredient) => [ingredient.sourceId as number, ingredient]),
    );
    const ingredientBySlug = new Map(
      targetIngredients.flatMap((ingredient) => ingredient.slug ? [[ingredient.slug, ingredient]] : []),
    );
    const formBySourceId = new Map<number, string>();
    const targetFormByName = new Map(targetForms.map((form) => [form.name, form]));
    const targetUnitByShortName = new Map(targetUnits.map((unit) => [unit.shortName, unit]));
    const sourceUnitById = new Map(sourceUnits.map((unit) => [unit.id, unit]));

    const unspecifiedForm = targetFormByName.get("Unspecified");
    if (!unspecifiedForm) throw new Error("Missing target ingredient form: Unspecified");
    formBySourceId.set(0, unspecifiedForm.id);
    for (const form of sourceForms) {
      const targetForm = targetFormByName.get(cleanTitle(form.name));
      if (targetForm) formBySourceId.set(form.id, targetForm.id);
    }

    const unresolved = {
      sourceRecipe: 0,
      sourceIngredient: 0,
      sourceForm: 0,
      sourceUnit: 0,
      targetUnit: 0,
      editorialIngredient: 0,
      editorialForm: 0,
      editorialUnit: 0,
    };
    const skipped = {
      duplicateSourceEntries: 0,
      unmappedSourceEntries: 0,
      unsupportedUnitEntries: 0,
      sourceEmptyWithoutEditorial: 0,
    };

    const prepared = recipes.map((recipe) => {
      const sourceRecipe = recipe.sourceId ? sourceById.get(recipe.sourceId) : null;
      unresolved.sourceRecipe += Number(!sourceRecipe);
      const editorial = EDITORIAL_INGREDIENTS[recipe.slug];
      const expected: ExpectedIngredient[] = [];

      if (editorial) {
        editorial.forEach((entry, index) => {
          const ingredient = ingredientBySlug.get(entry.slug);
          const form = targetFormByName.get(entry.form);
          const unit = targetUnitByShortName.get(entry.unit);
          unresolved.editorialIngredient += Number(!ingredient);
          unresolved.editorialForm += Number(!form);
          unresolved.editorialUnit += Number(!unit);
          if (!ingredient || !form || !unit) return;
          expected.push({
            ingredientId: ingredient.id,
            formId: form.id,
            unitId: unit.id,
            quantity: entry.quantity,
            position: index + 1,
            label: ingredient.name,
          });
        });
      } else {
        const parsed = parseIngredients(sourceRecipe?.ingrs_list ?? null);
        const { deduped, removed } = dedupeSourceEntries(parsed);
        skipped.duplicateSourceEntries += removed;
        if (deduped.length === 0) skipped.sourceEmptyWithoutEditorial += 1;

        deduped.forEach((entry) => {
          const ingredient = ingredientBySourceId.get(entry.sourceIngredientId);
          const formId = formBySourceId.get(entry.sourceFormId);
          const sourceUnit = sourceUnitById.get(entry.sourceUnitId);
          const targetUnit = sourceUnit
            ? targetUnitByShortName.get(targetUnitShortName(sourceUnit.short_name))
            : null;

          unresolved.sourceIngredient += Number(!ingredient);
          unresolved.sourceForm += Number(!formId);
          unresolved.sourceUnit += Number(!sourceUnit);
          unresolved.targetUnit += Number(Boolean(sourceUnit) && !targetUnit);
          if (!ingredient || !formId || !sourceUnit || !targetUnit) {
            skipped.unmappedSourceEntries += 1;
            skipped.unsupportedUnitEntries += Number(Boolean(sourceUnit) && !targetUnit);
            return;
          }

          expected.push({
            ingredientId: ingredient.id,
            formId,
            unitId: targetUnit.id,
            quantity: entry.quantity,
            position: expected.length + 1,
            label: ingredient.name,
          });
        });
      }

      const current = recipe.recipeIngredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        formId: ingredient.formId,
        unitId: ingredient.unitId,
        quantity: ingredient.quantity,
        position: ingredient.position,
        label: ingredient.ingredient.name,
      }));
      const changed = ingredientSignature(current) !== ingredientSignature(expected);

      return { recipe, expected, current, changed, editorial: Boolean(editorial) };
    });

    const changed = prepared.filter((row) => row.changed);
    const missingAfter = prepared.filter((row) => row.expected.length === 0);
    const editorialRows = prepared.filter((row) => row.editorial);
    const exactDuplicateGroupsAfter = prepared.reduce((total, row) => {
      const keys = new Map<string, number>();
      for (const ingredient of row.expected) {
        const key = [
          ingredient.ingredientId,
          ingredient.formId,
          ingredient.unitId,
          ingredient.quantity,
        ].join("|");
        keys.set(key, (keys.get(key) ?? 0) + 1);
      }
      return total + [...keys.values()].filter((count) => count > 1).length;
    }, 0);

    console.log(`Recipes audited for ingredients: ${prepared.length}`);
    console.log(`Recipes requiring ingredient sync: ${changed.length}`);
    console.log(`Editorial source-empty recipes filled: ${editorialRows.length}`);
    console.log(`Recipes that will remain without ingredients: ${missingAfter.length}`);
    console.log(`Duplicate source entries removed from expected lists: ${skipped.duplicateSourceEntries}`);
    console.log(`Exact duplicate ingredient groups after cleanup: ${exactDuplicateGroupsAfter}`);
    console.log(`Unresolved mapping summary: ${JSON.stringify(unresolved)}`);
    console.log(`Skipped source-entry summary: ${JSON.stringify(skipped)}`);

    const samples = [
      ...sampleSlugs,
      ...changed.slice(0, 10).map((row) => row.recipe.slug),
    ];
    for (const slug of [...new Set(samples)]) {
      const sample = prepared.find((row) => row.recipe.slug === slug);
      if (!sample) {
        console.warn(`Sample recipe not found: ${slug}`);
        continue;
      }
      console.log(`\n--- SAMPLE: ${sample.recipe.title} [${sample.recipe.slug}] ---`);
      console.log(`Current ingredients (${sample.current.length}):`);
      sample.current.forEach((ingredient) => {
        console.log(
          `${ingredient.position}. ${ingredient.label} - ${ingredient.quantity}`,
        );
      });
      console.log(`Expected ingredients (${sample.expected.length}):`);
      sample.expected.forEach((ingredient) => {
        console.log(
          `${ingredient.position}. ${ingredient.label} - ${ingredient.quantity}`,
        );
      });
    }

    if (
      unresolved.editorialIngredient ||
      unresolved.editorialForm ||
      unresolved.editorialUnit ||
      missingAfter.length > 0
    ) {
      throw new Error("Recipe ingredient quality checks failed. Review unresolved mappings.");
    }

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply to write recipe ingredients.");
      return;
    }

    const batchSize = 50;
    for (let index = 0; index < changed.length; index += batchSize) {
      const batch = changed.slice(index, index + batchSize);
      await targetDb.$transaction(async (transaction) => {
        for (const row of batch) {
          await transaction.recipeIngredients.deleteMany({
            where: { recipeId: row.recipe.id },
          });
          if (row.expected.length > 0) {
            await transaction.recipeIngredients.createMany({
              data: row.expected.map((ingredient) => ({
                recipeId: row.recipe.id,
                ingredientId: ingredient.ingredientId,
                formId: ingredient.formId,
                unitId: ingredient.unitId,
                quantity: ingredient.quantity,
                position: ingredient.position,
              })),
            });
          }
        }
      });
      console.log(`Synced ${Math.min(index + batch.length, changed.length)}/${changed.length} recipes.`);
    }

    console.log("Recipe ingredient backfill complete.");
  } finally {
    await targetDb.$disconnect();
    await sourceDb.$disconnect();
  }
}

main().catch((error) => {
  console.error("Recipe ingredient backfill failed:", error);
  process.exitCode = 1;
});
