import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import { normalizeIngredientDisplayName } from "../lib/ingredients";

loadEnvConfig(process.cwd());

type SourceIngredient = {
  id: number;
  name: string;
};

type SourceRecipe = {
  id: number;
  ingrs_list: string | null;
};

type SourceUnit = {
  id: number;
  short_name: string;
  diet: number;
};

type ParsedSourceIngredient = {
  sourceIngredientId: number;
  quantity: number;
  sourceUnitId: number;
  grams: number;
};

const SOURCE_DATABASE_NAME = "8well";
const shouldApply = process.argv.includes("--apply");

const curatedNutrition: Record<string, Record<string, number>> = {
  "black-rice": {
    calories: 145,
    carbohydrate: 31.3,
    totalFat: 0.4,
    dietaryFiber: 1.8,
    protein: 3.5,
    vitaminA: 0,
    ascorbicAcids: 0,
    vitaminD: 0,
    tocopherolEquivalent: 0.1,
    vitaminK: 0,
    thiamine: 0.16,
    riboflavin: 0.02,
    totalB6: 0.05,
    folates: 8,
    calcium: 4,
    iron: 1.5,
    phosphorus: 82,
    potassium: 86,
    sodium: 0,
    zinc: 1.1,
  },
  "chia-seeds": {
    calories: 486,
    carbohydrate: 42.1,
    totalFat: 30.7,
    dietaryFiber: 34.4,
    protein: 16.5,
    vitaminA: 3,
    ascorbicAcids: 1.6,
    vitaminD: 0,
    tocopherolEquivalent: 0.5,
    vitaminK: 0,
    thiamine: 0.62,
    riboflavin: 0.17,
    totalB6: 0.1,
    folates: 49,
    calcium: 631,
    iron: 7.7,
    phosphorus: 860,
    potassium: 407,
    sodium: 16,
    zinc: 4.6,
  },
  "colocasia-leaves": { vitaminD: 0 },
  "egg-white": {
    calories: 52,
    carbohydrate: 0.7,
    totalFat: 0.2,
    dietaryFiber: 0,
    protein: 10.9,
    vitaminA: 0,
    ascorbicAcids: 0,
    vitaminD: 0,
    tocopherolEquivalent: 0,
    vitaminK: 0,
    thiamine: 0.004,
    riboflavin: 0.439,
    totalB6: 0.005,
    folates: 4,
    calcium: 7,
    iron: 0.08,
    phosphorus: 15,
    potassium: 163,
    sodium: 166,
    zinc: 0.03,
  },
  "flat-beans": { vitaminD: 0 },
  "glue-berry": {
    calories: 70,
    carbohydrate: 16,
    totalFat: 0.3,
    dietaryFiber: 3,
    protein: 1,
    vitaminA: 3,
    ascorbicAcids: 20,
    vitaminD: 0,
    tocopherolEquivalent: 0.5,
    vitaminK: 5,
    thiamine: 0.03,
    riboflavin: 0.04,
    totalB6: 0.06,
    folates: 10,
    calcium: 20,
    iron: 0.5,
    phosphorus: 20,
    potassium: 180,
    sodium: 2,
    zinc: 0.1,
  },
  "red-capsicum": { vitaminD: 0 },
  "rolled-oats": {
    vitaminA: 0,
    ascorbicAcids: 0,
    vitaminD: 0,
    tocopherolEquivalent: 0.42,
    vitaminK: 2,
  },
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to backfill ingredient catalog.`);
  return value;
}

function sourceDatabaseUrl() {
  if (process.env.SOURCE_8WELL_DATABASE_URL) return process.env.SOURCE_8WELL_DATABASE_URL;
  const url = new URL(requireEnv("DATABASE_URL"));
  url.pathname = `/${SOURCE_DATABASE_NAME}`;
  return url.toString();
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

function round(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function median(values: number[]) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function parseSourceIngredients(raw: string | null) {
  return String(raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry): ParsedSourceIngredient[] => {
      const [ingredientId, , quantity, unitId, grams] = entry
        .split("#")
        .map((field) => Number(field));
      if (
        !Number.isInteger(ingredientId) ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(unitId) ||
        !Number.isFinite(grams) ||
        grams <= 0
      ) {
        return [];
      }

      return [{
        sourceIngredientId: ingredientId,
        quantity,
        sourceUnitId: unitId,
        grams,
      }];
    });
}

async function readSource(sourceDb: PrismaClient) {
  const [ingredients, recipes, units] = await Promise.all([
    sourceDb.$queryRawUnsafe<SourceIngredient[]>(
      "SELECT id, name FROM ingredients ORDER BY id",
    ),
    sourceDb.$queryRawUnsafe<SourceRecipe[]>(
      "SELECT id, ingrs_list FROM app_recipes ORDER BY id",
    ),
    sourceDb.$queryRawUnsafe<SourceUnit[]>(
      "SELECT id, short_name, diet FROM units WHERE diet = 1 ORDER BY id",
    ),
  ]);

  return { ingredients, recipes, units };
}

async function main() {
  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({ datasources: { db: { url: sourceDatabaseUrl() } } });

  try {
    const [{ ingredients: sourceIngredients, recipes: sourceRecipes, units: sourceUnits }, targetIngredients, targetUnits, recipeIngredientRows] =
      await Promise.all([
        readSource(sourceDb),
        targetDb.ingredients.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            sourceId: true,
            calories: true,
            carbohydrate: true,
            totalFat: true,
            dietaryFiber: true,
            protein: true,
            vitaminA: true,
            ascorbicAcids: true,
            vitaminD: true,
            tocopherolEquivalent: true,
            vitaminK: true,
            thiamine: true,
            riboflavin: true,
            totalB6: true,
            folates: true,
            calcium: true,
            iron: true,
            phosphorus: true,
            potassium: true,
            sodium: true,
            zinc: true,
          },
          orderBy: { name: "asc" },
        }),
        targetDb.units.findMany({ select: { id: true, shortName: true } }),
        targetDb.recipeIngredients.findMany({
          select: {
            recipeId: true,
            quantity: true,
            unit: { select: { id: true, shortName: true } },
            ingredient: {
              select: {
                id: true,
                name: true,
                sourceId: true,
                IngredientUnitMeasurements: { select: { unitId: true } },
              },
            },
          },
        }),
      ]);

    const sourceIngredientNames = new Map(sourceIngredients.map((row) => [row.id, row.name]));
    const targetUnitByShortName = new Map(targetUnits.map((unit) => [unit.shortName, unit]));
    const sourceUnitToTargetUnit = new Map(
      sourceUnits.flatMap((unit) => {
        const target = targetUnitByShortName.get(targetUnitShortName(unit.short_name));
        return target ? [[unit.id, target] as const] : [];
      }),
    );

    const gramsPerIngredientUnit = new Map<string, number[]>();
    for (const sourceRecipe of sourceRecipes) {
      for (const entry of parseSourceIngredients(sourceRecipe.ingrs_list)) {
        const targetUnit = sourceUnitToTargetUnit.get(entry.sourceUnitId);
        if (!targetUnit) continue;
        const key = `${entry.sourceIngredientId}|${targetUnit.id}`;
        const values = gramsPerIngredientUnit.get(key) ?? [];
        values.push(entry.grams / entry.quantity);
        gramsPerIngredientUnit.set(key, values);
      }
    }

    const nameUpdates = targetIngredients
      .map((ingredient) => {
        const sourceName = ingredient.sourceId
          ? sourceIngredientNames.get(ingredient.sourceId)
          : null;
        const nextName = normalizeIngredientDisplayName(sourceName ?? ingredient.name);
        return { id: ingredient.id, from: ingredient.name, to: nextName };
      })
      .filter((update) => update.from !== update.to);

    const nutritionUpdates = targetIngredients
      .map((ingredient) => {
        if (!ingredient.slug) return null;
        const curated = curatedNutrition[ingredient.slug];
        if (!curated) return null;
        const data = Object.fromEntries(
          Object.entries(curated).filter(([field, value]) => {
            const current = ingredient[field as keyof typeof ingredient];
            return current === null || current !== value;
          }),
        );
        return Object.keys(data).length ? { id: ingredient.id, name: ingredient.name, data } : null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; data: Record<string, number> }>;

    const missingConversionRows = recipeIngredientRows.filter((row) => {
      const shortName = row.unit.shortName.toLowerCase();
      return (
        !["g", "gm"].includes(shortName) &&
        !row.ingredient.IngredientUnitMeasurements.some(
          (measurement) => measurement.unitId === row.unit.id,
        )
      );
    });
    const conversionUpdates = new Map<string, {
      ingredientId: string;
      ingredientName: string;
      unitId: string;
      unitShortName: string;
      values: number;
      samples: number;
    }>();
    const unresolvedConversions: string[] = [];

    for (const row of missingConversionRows) {
      if (!row.ingredient.sourceId) {
        unresolvedConversions.push(`${row.ingredient.name} (${row.unit.shortName})`);
        continue;
      }
      const grams = gramsPerIngredientUnit.get(`${row.ingredient.sourceId}|${row.unit.id}`);
      if (!grams?.length) {
        unresolvedConversions.push(`${row.ingredient.name} (${row.unit.shortName})`);
        continue;
      }
      const key = `${row.ingredient.id}|${row.unit.id}`;
      conversionUpdates.set(key, {
        ingredientId: row.ingredient.id,
        ingredientName: row.ingredient.name,
        unitId: row.unit.id,
        unitShortName: row.unit.shortName,
        values: round(median(grams)),
        samples: grams.length,
      });
    }

    console.log(`Ingredient names to clean: ${nameUpdates.length}`);
    console.log(`Nutrition rows to complete: ${nutritionUpdates.length}`);
    console.log(`Missing conversion rows found: ${missingConversionRows.length}`);
    console.log(`Ingredient-unit conversions to add: ${conversionUpdates.size}`);
    console.log(`Unresolved conversions after source lookup: ${new Set(unresolvedConversions).size}`);

    nameUpdates.slice(0, 25).forEach((update) =>
      console.log(`Name: ${update.from} -> ${update.to}`),
    );
    nutritionUpdates.forEach((update) =>
      console.log(`Nutrition: ${update.name} (${Object.keys(update.data).join(", ")})`),
    );
    [...conversionUpdates.values()].slice(0, 25).forEach((update) =>
      console.log(
        `Conversion: ${update.ingredientName} ${update.unitShortName} = ${update.values} g (${update.samples} source samples)`,
      ),
    );
    [...new Set(unresolvedConversions)].slice(0, 25).forEach((entry) =>
      console.warn(`Unresolved conversion: ${entry}`),
    );

    if (unresolvedConversions.length > 0) {
      throw new Error("Some missing conversions could not be resolved from source recipe grams.");
    }

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply to update ingredient catalog.");
      return;
    }

    const batchSize = 100;
    for (let index = 0; index < nameUpdates.length; index += batchSize) {
      const batch = nameUpdates.slice(index, index + batchSize);
      await targetDb.$transaction(
        batch.map((update) =>
          targetDb.ingredients.update({
            where: { id: update.id },
            data: { name: update.to },
          }),
        ),
      );
      console.log(`Updated names ${Math.min(index + batch.length, nameUpdates.length)}/${nameUpdates.length}`);
    }

    for (const update of nutritionUpdates) {
      await targetDb.ingredients.update({
        where: { id: update.id },
        data: update.data,
      });
    }
    if (nutritionUpdates.length > 0) {
      console.log(`Completed nutrition for ${nutritionUpdates.length} ingredients.`);
    }

    await targetDb.ingredientUnitMeasurements.createMany({
      data: [...conversionUpdates.values()].map((update) => ({
        ingredientId: update.ingredientId,
        unitId: update.unitId,
        values: update.values,
      })),
      skipDuplicates: true,
    });
    console.log(`Added ${conversionUpdates.size} ingredient-unit conversions.`);
  } finally {
    await targetDb.$disconnect();
    await sourceDb.$disconnect();
  }
}

main().catch((error) => {
  console.error("[INGREDIENT_CATALOG_BACKFILL]", error);
  process.exitCode = 1;
});
