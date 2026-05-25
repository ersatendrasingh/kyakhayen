"use server";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { RecipeWithCategory } from "@/types/recipe";

type SearchInput = {
  k?: string;
};

export type RecipeSearchSuggestion = {
  label: string;
  query: string;
  kind: "Dish" | "Ingredient" | "Cuisine" | "Mealtime" | "Preference" | "Collection";
};

const stopWords = new Set([
  "recipe",
  "recipes",
  "dish",
  "dishes",
  "food",
  "ki",
  "ka",
  "ke",
  "wali",
  "wala",
  "banaye",
  "banayen",
  "banao",
  "ideas",
]);

const tokenAliases: Record<string, string[]> = {
  paner: ["paneer"],
  panner: ["paneer"],
  razma: ["rajma"],
  rajama: ["rajma"],
  chhole: ["chole"],
  brrekfast: ["breakfast"],
  nashta: ["breakfast"],
  subah: ["breakfast"],
  anda: ["egg", "eggetarian"],
  chicken: ["non veg", "chicken"],
  garmi: ["summer"],
  juice: ["beverage", "smoothie"],
  juices: ["beverage", "smoothie"],
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function searchTokens(query: string) {
  const normalized = normalize(query);
  const baseTokens = normalized
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((token) => !stopWords.has(token));
  const expanded = baseTokens.flatMap((token) => [token, ...(tokenAliases[token] || [])]);

  return Array.from(new Set(expanded.length > 0 ? expanded : [normalized])).filter(Boolean);
}

const searchRecipeInclude = {
  RecipeCategories: true,
  recipeIngredients: {
    include: {
      unit: true,
      ingredientForm: true,
      ingredient: { include: { IngredientUnitMeasurements: true } },
    },
    orderBy: { position: "asc" },
  },
  recipeMethods: { orderBy: { position: "asc" } },
  recipeCookingMethods: { include: { cookingMethod: true } },
  recipeCuisine: { include: { cuisine: true } },
  recipeDietType: {
    where: { dietType: { isPublished: true } },
    include: { dietType: true },
  },
  recipeRecipeType: {
    where: { recipeType: { isPublished: true } },
    include: { recipeType: true },
  },
  recipeNutrient: {
    where: { nutrient: { isPublished: true } },
    include: { nutrient: true },
  },
  recipeMealTime: { include: { mealTime: true } },
  recipeComments: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
  Review: true,
  recipeCookingTime: true,
  recipeDifficulty: true,
  recipeSeasons: true,
} satisfies Prisma.RecipesInclude;

function fieldMatches(tokens: string[]): Prisma.RecipesWhereInput[] {
  return tokens.flatMap((term) => [
    { title: { contains: term } },
    { description: { contains: term } },
    { RecipeCategories: { name: { contains: term } } },
    { recipeIngredients: { some: { ingredient: { name: { contains: term } } } } },
    { recipeMealTime: { some: { mealTime: { title: { contains: term } } } } },
    { recipeCuisine: { some: { cuisine: { title: { contains: term } } } } },
    { recipeDietType: { some: { dietType: { isPublished: true, title: { contains: term } } } } },
    { recipeRecipeType: { some: { recipeType: { isPublished: true, title: { contains: term } } } } },
    { recipeSeasons: { title: { contains: term } } },
  ]);
}

function scoreRecipe(recipe: Awaited<ReturnType<typeof searchCandidates>>[number], query: string, tokens: string[]) {
  const title = normalize(recipe.title);
  const category = normalize(recipe.RecipeCategories?.name || "");
  const ingredients = normalize(recipe.recipeIngredients.map((item) => item.ingredient.name).join(" "));
  const cuisines = normalize(recipe.recipeCuisine.map((item) => item.cuisine.title).join(" "));
  const mealtimes = normalize(recipe.recipeMealTime.map((item) => item.mealTime.title).join(" "));
  const types = normalize(recipe.recipeRecipeType.map((item) => item.recipeType.title).join(" "));
  const normalizedQuery = normalize(query);
  let score = Math.min(recipe.views || 0, 120) / 24;

  if (title === normalizedQuery) score += 140;
  if (title.includes(normalizedQuery)) score += 72;

  tokens.forEach((token) => {
    if (title.includes(token)) score += 34;
    if (ingredients.includes(token)) score += 27;
    if (cuisines.includes(token)) score += 20;
    if (mealtimes.includes(token)) score += 19;
    if (category.includes(token)) score += 18;
    if (types.includes(token)) score += 14;
  });

  return score;
}

async function searchCandidates(tokens: string[]) {
  return db.recipes.findMany({
    where: {
      isPublished: true,
      imageUrl: { not: null },
      OR: fieldMatches(tokens),
    },
    include: searchRecipeInclude,
    orderBy: { views: "desc" },
    take: 80,
  });
}

export const GetSearchedRecipes = async ({
  k,
}: SearchInput): Promise<RecipeWithCategory[]> => {
  const query = k?.trim();
  if (!query) return [];

  try {
    const tokens = searchTokens(query);
    const recipes = await searchCandidates(tokens);

    return recipes
      .map((recipe) => ({ recipe, score: scoreRecipe(recipe, query, tokens) }))
      .sort((left, right) => right.score - left.score || right.recipe.views - left.recipe.views)
      .map(({ recipe }) => recipe);
  } catch (error) {
    console.error("[SEARCH_RECIPES]", error);
    return [];
  }
};

export const GetRecipeSearchSuggestions = async ({
  k,
}: SearchInput): Promise<RecipeSearchSuggestion[]> => {
  const query = k?.trim();
  if (!query || query.length < 2) return [];

  try {
    const tokens = searchTokens(query);
    const containsAny = tokens.map((token) => ({ contains: token }));
    const [recipes, ingredients, cuisines, mealTimes, categories, recipeTypes] =
      await Promise.all([
        db.recipes.findMany({
          where: {
            isPublished: true,
            imageUrl: { not: null },
            OR: fieldMatches(tokens),
          },
          select: { title: true },
          orderBy: { views: "desc" },
          take: 4,
        }),
        db.ingredients.findMany({
          where: { OR: containsAny.map((name) => ({ name })) },
          select: { name: true },
          take: 3,
        }),
        db.cuisines.findMany({
          where: { isPublished: true, OR: containsAny.map((title) => ({ title })) },
          select: { title: true },
          take: 2,
        }),
        db.mealTimes.findMany({
          where: { isPublished: true, OR: containsAny.map((title) => ({ title })) },
          select: { title: true },
          take: 2,
        }),
        db.recipeCategories.findMany({
          where: { isPublished: true, OR: containsAny.map((name) => ({ name })) },
          select: { name: true },
          take: 2,
        }),
        db.recipeTypes.findMany({
          where: { isPublished: true, OR: containsAny.map((title) => ({ title })) },
          select: { title: true },
          take: 2,
        }),
      ]);

    const suggestions: RecipeSearchSuggestion[] = [
      ...ingredients.map((item) => ({
        label: `${item.name} recipes`,
        query: item.name,
        kind: "Ingredient" as const,
      })),
      ...mealTimes.map((item) => ({
        label: `${item.title} recipes`,
        query: item.title,
        kind: "Mealtime" as const,
      })),
      ...cuisines.map((item) => ({
        label: `${item.title} recipes`,
        query: item.title,
        kind: "Cuisine" as const,
      })),
      ...categories.map((item) => ({
        label: `${item.name} recipes`,
        query: item.name,
        kind: "Preference" as const,
      })),
      ...recipeTypes.map((item) => ({
        label: `${item.title} recipes`,
        query: item.title,
        kind: "Collection" as const,
      })),
      ...recipes.map((item) => ({
        label: item.title,
        query: item.title,
        kind: "Dish" as const,
      })),
    ];
    const unique = new Map<string, RecipeSearchSuggestion>();

    suggestions.forEach((suggestion) => {
      const key = suggestion.label.toLowerCase();
      if (!unique.has(key)) unique.set(key, suggestion);
    });

    return Array.from(unique.values()).slice(0, 8);
  } catch (error) {
    console.error("[SEARCH_SUGGESTIONS]", error);
    return [];
  }
};
