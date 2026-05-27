import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import {
  getIngredientSlug,
  normalizeIngredientDisplayName,
  normalizeIngredientName,
} from "../lib/ingredients";
import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

type NutritionSource = "NIN" | "USDA" | "LEGACY_MANUAL_REVIEW";

type SourceIngredient = {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  food_group_category: string | null;
  unit_measurement: string | null;
  nin_id: string | null;
  usda_id: string | null;
  enerc: number | null;
  choavldf: number | null;
  fatce: number | null;
  fibtg: number | null;
  protcnt: number | null;
  vita: number | null;
  vitc: number | null;
  vitd: number | null;
  vite: number | null;
  vitk: number | null;
  thia: number | null;
  ribf: number | null;
  vitb6c: number | null;
  folsum: number | null;
  ca: number | null;
  fe: number | null;
  p: number | null;
  k: number | null;
  na: number | null;
  zn: number | null;
};

type SourceUnit = {
  id: number;
  name: string;
  short_name: string;
  diet: number;
};

type PreparedIngredient = {
  source: SourceIngredient;
  name: string;
  slug: string;
  categoryName: string;
  nutritionSource: NutritionSource;
  isPublished: boolean;
  nutrition: ReturnType<typeof mapNutrition>;
  measurements: Map<number, number>;
  ignoredMeasurements: number;
};

const SOURCE_SYSTEM = "8well";
const SOURCE_DATABASE_NAME = "8well";
const shouldApply = process.argv.includes("--apply");
const recipeForms = [
  "Fresh",
  "Raw",
  "Cooked",
  "Boiled",
  "Roasted",
  "Dried",
  "Ground",
  "Chopped",
  "Grated",
  "Pureed",
];
const nonCalculableUnits = new Set([25, 26]);

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to import ingredients.`);
  }
  return value;
}

function getSourceDatabaseUrl() {
  if (process.env.SOURCE_8WELL_DATABASE_URL) {
    return process.env.SOURCE_8WELL_DATABASE_URL;
  }

  const sourceUrl = new URL(requireEnv("DATABASE_URL"));
  sourceUrl.pathname = `/${SOURCE_DATABASE_NAME}`;
  return sourceUrl.toString();
}

function round(value: number | null, multiplier = 1) {
  if (value === null) {
    return null;
  }
  return Math.round(value * multiplier * 1_000_000) / 1_000_000;
}

function getNutritionSource(row: SourceIngredient): NutritionSource {
  if (row.nin_id?.trim()) {
    return "NIN";
  }
  if (row.usda_id?.trim()) {
    return "USDA";
  }
  return "LEGACY_MANUAL_REVIEW";
}

function mapNutrition(row: SourceIngredient, source = getNutritionSource(row)) {
  const isNin = source === "NIN";

  return {
    calories: round(row.enerc),
    carbohydrate: round(row.choavldf),
    totalFat: round(row.fatce),
    dietaryFiber: round(row.fibtg),
    protein: round(row.protcnt),
    vitaminA: round(row.vita, isNin ? 1_000_000 : 1),
    ascorbicAcids: round(row.vitc, isNin ? 1_000 : 1),
    vitaminD: round(row.vitd, isNin ? 1_000_000 : 1),
    tocopherolEquivalent: round(row.vite),
    vitaminK: round(row.vitk, isNin ? 1_000_000 : 1),
    thiamine: round(row.thia),
    riboflavin: round(row.ribf),
    totalB6: round(row.vitb6c, isNin ? 1_000 : 1),
    folates: round(row.folsum, isNin ? 1_000_000 : 1),
    calcium: round(row.ca, isNin ? 1_000 : 1),
    iron: round(row.fe, isNin ? 1_000 : 1),
    phosphorus: round(row.p, isNin ? 1_000 : 1),
    potassium: round(row.k, isNin ? 1_000 : 1),
    sodium: round(row.na, isNin ? 1_000 : 1),
    zinc: round(row.zn),
  };
}

function hasValidMacros(nutrition: ReturnType<typeof mapNutrition>) {
  const ranges = [
    [nutrition.calories, 0, 900],
    [nutrition.carbohydrate, 0, 100],
    [nutrition.totalFat, 0, 100],
    [nutrition.dietaryFiber, 0, 100],
    [nutrition.protein, 0, 100],
  ] as const;

  return ranges.every(
    ([value, min, max]) => value !== null && value >= min && value <= max
  );
}

function categoryFor(row: SourceIngredient) {
  if (row.category_name?.trim()) {
    return normalizeIngredientName(row.category_name);
  }

  if (getNutritionSource(row) === "LEGACY_MANUAL_REVIEW") {
    return "Others";
  }

  switch (row.food_group_category?.trim().toLowerCase()) {
    case "cereal":
      return "Cereals and Pulses";
    case "fruits":
    case "vegetable":
      return "Fruits and Vegetables";
    case "beverage":
      return "Beverages";
    case "nuts":
      return "Nuts and Seeds";
    case "protein":
      return "Protein Sources";
    case "snacks":
      return "Snacks";
    default:
      return "Others";
  }
}

function isObviousTestRow(row: SourceIngredient) {
  return /^test[\d_-]*$/i.test(row.name.trim());
}

function parseMeasurements(raw: string | null) {
  const measurements = new Map<number, number>();
  let ignoredMeasurements = 0;

  raw
    ?.split("#")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const [sourceUnitId, grams] = entry.split(":").map(Number);
      if (
        Number.isInteger(sourceUnitId) &&
        sourceUnitId > 0 &&
        Number.isFinite(grams) &&
        grams > 0 &&
        !nonCalculableUnits.has(sourceUnitId)
      ) {
        measurements.set(sourceUnitId, grams);
      } else {
        ignoredMeasurements += 1;
      }
    });

  return { measurements, ignoredMeasurements };
}

function mapUnit(unit: SourceUnit) {
  if (!unit.diet) {
    return null;
  }

  switch (unit.short_name.trim().toLowerCase()) {
    case "gm":
      return { title: "Gram", shortName: "g" };
    case "lit":
      return { title: "Litre", shortName: "l" };
    case "to taste":
      return { title: "To Taste", shortName: "to-taste" };
    case "as required":
      return { title: "As Required", shortName: "as-required" };
    default:
      return {
        title: normalizeIngredientName(unit.name),
        shortName: unit.short_name.trim().toLowerCase(),
      };
  }
}

async function readSource(sourceDb: PrismaClient) {
  const ingredients = await sourceDb.$queryRawUnsafe<SourceIngredient[]>(`
    SELECT
      i.id, i.name, i.category_id, c.category_name,
      fg.category AS food_group_category, i.unit_measurement,
      i.nin_id, i.usda_id, i.enerc, i.choavldf, i.fatce, i.fibtg, i.protcnt,
      i.vita, i.vitc, i.vitd, i.vite, i.vitk, i.thia, i.ribf, i.vitb6c,
      i.folsum, i.ca, i.fe, i.p, i.k, i.na, i.zn
    FROM ingredients i
    LEFT JOIN ingredientscategory c ON c.id = i.category_id
    LEFT JOIN food_groups fg ON fg.id = i.food_group_id
    ORDER BY i.id
  `);
  const units = await sourceDb.$queryRawUnsafe<SourceUnit[]>(
    "SELECT id, name, short_name, diet FROM units ORDER BY id"
  );

  return { ingredients, units };
}

async function main() {
  const targetDb = new PrismaClient();
  const sourceDb = new PrismaClient({
    datasources: { db: { url: getSourceDatabaseUrl() } },
  });

  try {
    const { ingredients: sourceRows, units: sourceUnits } = await readSource(sourceDb);
    const excludedRows = sourceRows.filter(isObviousTestRow);
    const preparedRows: PreparedIngredient[] = sourceRows
      .filter((row) => !isObviousTestRow(row))
      .map((row) => {
        const nutritionSource = getNutritionSource(row);
        const nutrition = mapNutrition(row, nutritionSource);
        const parsedMeasurements = parseMeasurements(row.unit_measurement);
        return {
          source: row,
          name: normalizeIngredientDisplayName(row.name),
          slug: getIngredientSlug(row.name),
          categoryName: categoryFor(row),
          nutritionSource,
          isPublished:
            nutritionSource !== "LEGACY_MANUAL_REVIEW" &&
            hasValidMacros(nutrition),
          nutrition,
          measurements: parsedMeasurements.measurements,
          ignoredMeasurements: parsedMeasurements.ignoredMeasurements,
        };
      });
    const slugCounts = new Map<string, number>();
    preparedRows.forEach((row) =>
      slugCounts.set(row.slug, (slugCounts.get(row.slug) ?? 0) + 1)
    );
    const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1);

    if (duplicateSlugs.length > 0) {
      throw new Error(
        `Normalized source slugs collide: ${duplicateSlugs
          .map(([slug]) => slug)
          .join(", ")}`
      );
    }

    const validUnitMap = new Map(
      sourceUnits
        .map((unit) => [unit.id, mapUnit(unit)] as const)
        .filter(([, unit]) => unit !== null)
    );
    let validMeasurementCount = 0;
    let skippedMeasurementCount = 0;
    preparedRows.forEach((row) => {
      const measurementUnits = new Set(["g"]);
      row.measurements.forEach((_, sourceUnitId) => {
        const definition = validUnitMap.get(sourceUnitId);
        if (definition) {
          measurementUnits.add(definition.shortName);
        } else {
          skippedMeasurementCount += 1;
        }
      });
      validMeasurementCount += measurementUnits.size;
      skippedMeasurementCount += row.ignoredMeasurements;
    });
    const publishedCount = preparedRows.filter((row) => row.isPublished).length;
    const manualDraftCount = preparedRows.filter(
      (row) => row.nutritionSource === "LEGACY_MANUAL_REVIEW"
    ).length;
    const categoryNames = [...new Set(preparedRows.map((row) => row.categoryName))];

    console.log(`Source ingredients: ${sourceRows.length}`);
    console.log(`Excluded obvious test rows: ${excludedRows.length}`);
    console.log(`Prepared ingredient rows: ${preparedRows.length}`);
    console.log(`Publishable NIN/USDA rows: ${publishedCount}`);
    console.log(`Draft manual-review rows: ${manualDraftCount}`);
    console.log(`Categories required: ${categoryNames.length}`);
    console.log(`Food units available: ${validUnitMap.size}`);
    console.log(`Valid gram conversions to store: ${validMeasurementCount}`);
    console.log(`Unsupported measurement conversions skipped: ${skippedMeasurementCount}`);

    if (!shouldApply) {
      console.log("Dry run complete. Run with --apply after reviewing the import report.");
      return;
    }

    const categories = new Map<string, string>();
    for (const name of categoryNames) {
      const slug = slugify(name);
      const category = await targetDb.ingredientCategories.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      categories.set(name, category.id);
    }

    const units = new Map<number, string>();
    for (const [sourceUnitId, definition] of validUnitMap) {
      if (!definition) {
        continue;
      }
      const unit = await targetDb.units.upsert({
        where: { shortName: definition.shortName },
        update: { title: definition.title },
        create: definition,
      });
      units.set(sourceUnitId, unit.id);
    }
    const gramUnit = await targetDb.units.upsert({
      where: { shortName: "g" },
      update: { title: "Gram" },
      create: { title: "Gram", shortName: "g" },
    });

    for (const name of recipeForms) {
      await targetDb.ingredientsForm.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    for (const row of preparedRows) {
      const bySource = await targetDb.ingredients.findUnique({
        where: {
          sourceSystem_sourceId: {
            sourceSystem: SOURCE_SYSTEM,
            sourceId: row.source.id,
          },
        },
      });
      const bySlug = await targetDb.ingredients.findUnique({
        where: { slug: row.slug },
      });
      const byName = await targetDb.ingredients.findFirst({
        where: { name: row.name },
      });
      const existing = bySource ?? bySlug ?? byName;
      const data = {
        name: row.name,
        slug: row.slug,
        sourceSystem: SOURCE_SYSTEM,
        sourceId: row.source.id,
        nutritionSource: row.nutritionSource,
        nutritionBasisGrams: 100,
        ingredientCategoriesId: categories.get(row.categoryName),
        isPublished: row.isPublished,
        ...row.nutrition,
      };
      const ingredient = existing
        ? await targetDb.ingredients.update({
            where: { id: existing.id },
            data,
          })
        : await targetDb.ingredients.create({ data });

      await targetDb.ingredientUnitMeasurements.deleteMany({
        where: { ingredientId: ingredient.id },
      });
      const measurementData = new Map<string, number>([[gramUnit.id, 1]]);
      row.measurements.forEach((grams, sourceUnitId) => {
        const targetUnitId = units.get(sourceUnitId);
        if (targetUnitId) {
          measurementData.set(targetUnitId, grams);
        }
      });
      await targetDb.ingredientUnitMeasurements.createMany({
        data: [...measurementData.entries()].map(([unitId, values]) => ({
          ingredientId: ingredient.id,
          unitId,
          values,
        })),
      });
    }

    console.log(`Imported ingredient rows: ${preparedRows.length}`);
    console.log(`Published trusted nutrition rows: ${publishedCount}`);
    console.log(`Recipe forms ensured: ${recipeForms.length}`);
  } finally {
    await Promise.all([targetDb.$disconnect(), sourceDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error("[INGREDIENTS_IMPORT]", error);
  process.exit(1);
});
