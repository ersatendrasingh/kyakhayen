import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, relativePath), "utf8"));
const catalog = readJson("../data/meal-plan/early-morning-recipes.json");
const imageManifest = readJson("../data/meal-plan/early-morning-image-manifest.json");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uploadedImageUrlFor(slug) {
  const item = imageManifest.items.find((entry) => entry.slug === slug);
  if (!item) return null;
  return item.imageUrl || item.cloudFrontUrl || item.uploadedUrl || null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function recipeIngredientNames(recipe) {
  return recipe.ingredients.map((item) => item.name);
}

function visibleIngredientNames(recipe) {
  const names = recipeIngredientNames(recipe).filter(
    (name) => name.toLowerCase() !== "water",
  );
  return names.length > 0 ? names : recipeIngredientNames(recipe);
}

function htmlList(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function recipeDescriptionHtml(recipe) {
  const visibleNames = visibleIngredientNames(recipe);
  const escapedTitle = escapeHtml(recipe.title);
  const escapedIngredients = visibleNames.map(escapeHtml);
  const ingredientSentence =
    escapedIngredients.length > 1
      ? `${escapedIngredients.slice(0, -1).join(", ")} and ${escapedIngredients.at(-1)}`
      : escapedIngredients[0] || "water";
  const specialItems = visibleNames.slice(0, 4).map((name) => {
    const normalized = name.toLowerCase();
    if (normalized.includes("water")) {
      return `<strong>${escapeHtml(name)}:</strong> Keeps the recipe focused on simple early morning hydration.`;
    }
    if (normalized.includes("lemon")) {
      return `<strong>${escapeHtml(name)}:</strong> Adds a clean, bright note without turning the drink into juice.`;
    }
    if (
      normalized.includes("tulsi") ||
      normalized.includes("ginger") ||
      normalized.includes("cinnamon")
    ) {
      return `<strong>${escapeHtml(name)}:</strong> Adds a warm, aromatic character suited to cooler mornings.`;
    }
    return `<strong>${escapeHtml(name)}:</strong> Gives the water a gentle homemade infusion without making it heavy.`;
  });

  return [
    `<h2>${escapedTitle}: a gentle early morning hydration recipe</h2>`,
    `<p><strong>${escapedTitle}</strong> is a light early morning drink built around ${ingredientSentence}. It is intended as a calm hydration start before breakfast, not as a smoothie, juice, shake or meal replacement.</p>`,
    `<p>The recorded preparation flow takes about ${recipe.prepTime} minutes, making it practical for the first slot of a daily meal plan. Keep it unsweetened and simple so the morning remains light.</p>`,
    `<h3>What makes this ${escapedTitle} recipe useful</h3>`,
    `<p>This recipe keeps the early morning slot focused on water, warmth and gentle infusion. The goal is comfort and hydration rather than calories or a heavy drink.</p>`,
    `<ul>${htmlList(specialItems)}</ul>`,
    `<h3>Preparation approach and texture</h3>`,
    `<p>The technique here is simple steeping or serving. Use clean drinking water, keep the temperature comfortable, and avoid added sugar, sweeteners or heavy blending.</p>`,
    `<h3>Planning and preparation notes</h3>`,
    `<p>Use this as the first drink after waking. Seasonal options should rotate naturally through the week, while stronger infusions such as ajwain water should remain occasional.</p>`,
    `<h3>Kitchen tips for a better result</h3>`,
    `<ul><li>Use fresh, clean ingredients and drinking water.</li><li>Keep the drink plain and unsweetened.</li><li>Serve soon after preparing so the flavour stays clean.</li></ul>`,
    `<h3>How to serve ${escapedTitle}</h3>`,
    `<p>Serve in a small glass or cup in the early morning. Keep the portion modest and follow it later with the planned breakfast.</p>`,
    `<blockquote><p>Cook with the ingredient list and method as your primary guide; tags on Kya Khayen help with discovery and everyday preference-based planning, not medical advice.</p></blockquote>`,
  ].join("\n");
}

function metaDescription(recipe) {
  const names = visibleIngredientNames(recipe).slice(0, 2).join(" and ");
  return `${recipe.title} recipe with ${names}. Follow simple prep steps for a light early morning hydration option in everyday meal plans.`;
}

function methodSteps(recipe) {
  return [
    {
      title: "Prepare the drink",
      description: `<p>${escapeHtml(recipe.method)}</p>`,
    },
    {
      title: "Serve fresh",
      description:
        "<p>Serve immediately as an early morning hydration drink. Keep it unsweetened and do not pair it with juice, smoothie or shake in this slot.</p>",
    },
  ];
}

async function nextPosition(model) {
  const result = await model.aggregate({ _max: { position: true } });
  return (result._max.position || 0) + 1;
}

async function ensureRecipeCategory(slug, name) {
  const existing = await db.recipeCategories.findFirst({
    where: { OR: [{ slug }, { name }] },
  });

  if (existing) {
    return db.recipeCategories.update({
      where: { id: existing.id },
      data: { slug: existing.slug || slug, isPublished: true },
    });
  }

  return db.recipeCategories.create({
    data: {
      name,
      slug,
      isPublished: true,
      position: await nextPosition(db.recipeCategories),
    },
  });
}

async function ensureCuisine(slug, title) {
  const existing = await db.cuisines.findFirst({
    where: { OR: [{ slug }, { title }] },
  });

  if (existing) {
    return db.cuisines.update({
      where: { id: existing.id },
      data: { isPublished: true },
    });
  }

  return db.cuisines.create({
    data: {
      title,
      slug,
      isPublished: true,
      position: await nextPosition(db.cuisines),
    },
  });
}

async function ensureMealTime({ title, slug }) {
  const existing = await db.mealTimes.findUnique({ where: { slug } });

  if (existing) {
    return db.mealTimes.update({
      where: { id: existing.id },
      data: { title, isPublished: true },
    });
  }

  return db.mealTimes.create({
    data: {
      title,
      slug,
      isPublished: true,
      position: 1,
    },
  });
}

async function ensureRecipeType({ title, slug }) {
  const existing = await db.recipeTypes.findUnique({ where: { slug } });

  if (existing) {
    return db.recipeTypes.update({
      where: { id: existing.id },
      data: { title, isPublished: true },
    });
  }

  return db.recipeTypes.create({
    data: {
      title,
      slug,
      isPublished: true,
      position: await nextPosition(db.recipeTypes),
    },
  });
}

async function ensureDifficulty(title) {
  const existing =
    (await db.recipeDifficulty.findFirst({
      where: { title: { equals: title } },
      orderBy: { position: "asc" },
    })) ||
    (await db.recipeDifficulty.findFirst({
      orderBy: { position: "asc" },
    }));

  if (existing) return existing;

  return db.recipeDifficulty.create({
    data: { title, position: 1 },
  });
}

async function ensureSeason(title) {
  const existing = await db.recipeSeasons.findFirst({
    where: { title: { equals: title } },
  });

  if (existing) return existing;
  return db.recipeSeasons.create({ data: { title } });
}

async function ensureUnit(shortName) {
  const unitMap = {
    ml: "Milliliter",
    tsp: "Teaspoon",
    pc: "Piece",
    slice: "Slice",
    pinch: "Pinch",
  };
  const title = unitMap[shortName] || shortName;
  const existing = await db.units.findFirst({
    where: { OR: [{ shortName }, { title }] },
  });

  if (existing) return existing;

  return db.units.create({
    data: {
      title,
      shortName,
      position: await nextPosition(db.units),
    },
  });
}

async function ensureForm(name) {
  const existing = await db.ingredientsForm.findUnique({ where: { name } });
  if (existing) return existing;

  return db.ingredientsForm.create({
    data: {
      name,
      position: await nextPosition(db.ingredientsForm),
    },
  });
}

async function ensureIngredientCategory() {
  const slug = "morning-hydration";
  const name = "Morning Hydration";
  const existing = await db.ingredientCategories.findFirst({
    where: { OR: [{ slug }, { name }] },
  });

  if (existing) {
    return db.ingredientCategories.update({
      where: { id: existing.id },
      data: { isPublished: true },
    });
  }

  return db.ingredientCategories.create({
    data: {
      name,
      slug,
      isPublished: true,
      position: await nextPosition(db.ingredientCategories),
    },
  });
}

async function ensureIngredient(name, categoryId) {
  const slug = slugify(name);
  const existing = await db.ingredients.findFirst({
    where: { OR: [{ slug }, { name }] },
  });

  if (existing) {
    return db.ingredients.update({
      where: { id: existing.id },
      data: { isPublished: true },
    });
  }

  return db.ingredients.create({
    data: {
      name,
      slug,
      ingredientCategoriesId: categoryId,
      isPublished: true,
    },
  });
}

async function findPublishedBySlugs(model, slugs) {
  if (!slugs?.length) return [];
  return model.findMany({
    where: { slug: { in: slugs }, isPublished: true },
    select: { id: true, slug: true },
  });
}

async function seedRecipe(recipe, context) {
  const title = recipe.title.trim();
  const slug = recipe.slug || slugify(title);
  const imageUrl = uploadedImageUrlFor(slug);
  const existing = await db.recipes.findUnique({ where: { slug } });
  const now = new Date();
  const seasonIds = [];

  for (const seasonTitle of recipe.seasons || []) {
    const season = await ensureSeason(seasonTitle);
    seasonIds.push(season.id);
  }

  const savedRecipe = existing
    ? await db.recipes.update({
        where: { id: existing.id },
        data: {
          title,
          description: recipeDescriptionHtml(recipe),
          metaTitle: `${title} Recipe | Kya Khayen`,
          metaDescription: metaDescription(recipe),
          recipeCategoriesId: context.category?.id ?? null,
          recipeDifficultyId: context.difficulty.id,
          seasonality: recipe.seasonality,
          recipeSeasonsId: seasonIds[0] || null,
          ...(imageUrl ? { imageUrl } : {}),
          isPublished: true,
          publishedAt: existing.publishedAt || now,
          contentUpdatedAt: now,
        },
      })
    : await db.recipes.create({
        data: {
          title,
          slug,
          description: recipeDescriptionHtml(recipe),
          metaTitle: `${title} Recipe | Kya Khayen`,
          metaDescription: metaDescription(recipe),
          recipeCategoriesId: context.category?.id ?? null,
          recipeDifficultyId: context.difficulty.id,
          seasonality: recipe.seasonality,
          recipeSeasonsId: seasonIds[0] || null,
          imageUrl,
          isPublished: true,
          publishedAt: now,
          contentUpdatedAt: now,
        },
      });

  const ingredientRefs = [];
  for (const [index, item] of recipe.ingredients.entries()) {
    const ingredient = await ensureIngredient(
      item.name,
      context.ingredientCategory.id,
    );
    const unit = await ensureUnit(item.unit);
    const form = await ensureForm(item.form);
    ingredientRefs.push({ item, ingredient, unit, form, position: index + 1 });
  }
  const [dietTypes, nutrients] = await Promise.all([
    findPublishedBySlugs(db.dietTypes, recipe.dietTypes || []),
    findPublishedBySlugs(db.nutrient, recipe.nutrients || []),
  ]);

  await db.$transaction(async (tx) => {
    await tx.recipeMealTime.deleteMany({ where: { recipeId: savedRecipe.id } });
    await tx.recipeMealTime.create({
      data: { recipeId: savedRecipe.id, mealTimeId: context.mealTime.id },
    });

    await tx.recipeRecipeType.deleteMany({ where: { recipeId: savedRecipe.id } });
    if (context.recipeTypes.length > 0) {
      await tx.recipeRecipeType.createMany({
        data: context.recipeTypes.map((recipeType) => ({
          recipeId: savedRecipe.id,
          recipeTypeId: recipeType.id,
        })),
        skipDuplicates: true,
      });
    }

    await tx.recipeDietType.deleteMany({ where: { recipeId: savedRecipe.id } });
    if (dietTypes.length > 0) {
      await tx.recipeDietType.createMany({
        data: dietTypes.map((dietType) => ({
          recipeId: savedRecipe.id,
          dietTypeId: dietType.id,
        })),
        skipDuplicates: true,
      });
    }

    await tx.recipeNutrient.deleteMany({ where: { recipeId: savedRecipe.id } });
    if (nutrients.length > 0) {
      await tx.recipeNutrient.createMany({
        data: nutrients.map((nutrient) => ({
          recipeId: savedRecipe.id,
          nutrientId: nutrient.id,
        })),
        skipDuplicates: true,
      });
    }

    await tx.recipeCuisines.deleteMany({ where: { recipeId: savedRecipe.id } });
    await tx.recipeCuisines.create({
      data: { recipeId: savedRecipe.id, cuisineId: context.cuisine.id },
    });

    await tx.recipeDifficultyAssignment.deleteMany({
      where: { recipeId: savedRecipe.id },
    });
    await tx.recipeDifficultyAssignment.create({
      data: {
        recipeId: savedRecipe.id,
        recipeDifficultyId: context.difficulty.id,
      },
    });

    await tx.recipeSeasonAssignment.deleteMany({
      where: { recipeId: savedRecipe.id },
    });
    if (seasonIds.length > 0) {
      await tx.recipeSeasonAssignment.createMany({
        data: seasonIds.map((recipeSeasonsId) => ({
          recipeId: savedRecipe.id,
          recipeSeasonsId,
        })),
        skipDuplicates: true,
      });
    }

    await tx.recipeCookingTime.upsert({
      where: { recipeId: savedRecipe.id },
      update: {
        prepTime: recipe.prepTime,
        cookTime: 0,
        restTime: 0,
        totalTime: recipe.prepTime,
      },
      create: {
        recipeId: savedRecipe.id,
        prepTime: recipe.prepTime,
        cookTime: 0,
        restTime: 0,
        totalTime: recipe.prepTime,
      },
    });

    await tx.recipeMethods.deleteMany({ where: { recipeId: savedRecipe.id } });
    for (const [index, step] of methodSteps(recipe).entries()) {
      await tx.recipeMethods.create({
        data: {
          recipeId: savedRecipe.id,
          title: step.title,
          description: step.description,
          position: index + 1,
          isPublished: true,
        },
      });
    }

    await tx.recipeIngredients.deleteMany({ where: { recipeId: savedRecipe.id } });
    for (const ref of ingredientRefs) {
      await tx.recipeIngredients.create({
        data: {
          recipeId: savedRecipe.id,
          ingredientId: ref.ingredient.id,
          quantity: ref.item.quantity,
          unitId: ref.unit.id,
          formId: ref.form.id,
          position: ref.position,
        },
      });
    }
  });

  return savedRecipe;
}

async function main() {
  const category = catalog.taxonomy.categorySlug
    ? await ensureRecipeCategory(
        catalog.taxonomy.categorySlug,
        catalog.taxonomy.categoryName || catalog.taxonomy.categoryTitle || catalog.taxonomy.categorySlug,
      )
    : null;
  const cuisine = await ensureCuisine(catalog.taxonomy.cuisineSlug, "North Indian");
  const mealTime = await ensureMealTime(catalog.taxonomy.mealTime);
  const recipeTypeInputs =
    catalog.taxonomy.recipeTypes?.length
      ? catalog.taxonomy.recipeTypes
      : [catalog.taxonomy.recipeType].filter(Boolean);
  const recipeTypes = await Promise.all(recipeTypeInputs.map(ensureRecipeType));
  const difficulty = await ensureDifficulty(catalog.taxonomy.difficultyTitle);
  const ingredientCategory = await ensureIngredientCategory();
  const context = {
    category,
    cuisine,
    mealTime,
    recipeTypes,
    difficulty,
    ingredientCategory,
  };

  const seeded = [];
  for (const recipe of catalog.recipes) {
    const saved = await seedRecipe(recipe, context);
    seeded.push(saved.slug);
  }

  console.log(`Seeded ${seeded.length} early-morning recipes:`);
  for (const slug of seeded) {
    console.log(`- ${slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
