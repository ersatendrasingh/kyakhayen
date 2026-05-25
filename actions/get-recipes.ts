"use server";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { RecipeWithCategory } from "@/types/recipe";

type GetRecipesInput = {
  title?: string;
  searchSlug?: string;
  searchType?: string;
  foodPreferenceSlug?: string;
};

const recipeInclude = {
  RecipeCategories: true,
  recipeIngredients: {
    include: {
      unit: true,
      ingredientForm: true,
      ingredient: {
        include: {
          IngredientUnitMeasurements: true,
        },
      },
    },
    orderBy: { position: "asc" },
  },
  recipeMethods: {
    orderBy: { position: "asc" },
  },
  recipeCookingMethods: {
    include: { cookingMethod: true },
  },
  recipeCuisine: {
    include: { cuisine: true },
  },
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
  recipeCookingTime: true,
  recipeMealTime: true,
  recipeDifficulty: true,
  recipeSeasons: true,
  Review: true,
  recipeComments: {
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.RecipesInclude;

export const GetRecipes = async ({
  title,
  searchSlug,
  searchType,
  foodPreferenceSlug,
}: GetRecipesInput): Promise<RecipeWithCategory[]> => {
  try {
    const where: Prisma.RecipesWhereInput = {
      isPublished: true,
      ...(title ? { title: { contains: title } } : {}),
    };

    if (searchType === "category" && searchSlug) {
      const category = await db.recipeCategories.findFirst({
        where: {
          isPublished: true,
          slug:
            searchSlug === "egg"
              ? { in: ["eggetarian", "egg"] }
              : searchSlug,
        },
        select: { id: true },
      });

      if (!category) return [];
      where.recipeCategoriesId = category.id;
    }

    if (searchType === "mealTime" && searchSlug) {
      const mealTime = await db.mealTimes.findFirst({
        where: { isPublished: true, slug: searchSlug },
        select: { id: true },
      });

      if (!mealTime) return [];
      where.recipeMealTime = { some: { mealTimeId: mealTime.id } };
    }

    if (searchType === "cuisine" && searchSlug) {
      const cuisine = await db.cuisines.findFirst({
        where: { isPublished: true, slug: searchSlug },
        select: { id: true },
      });

      if (!cuisine) return [];
      where.recipeCuisine = { some: { cuisineId: cuisine.id } };
    }

    if (searchType === "recipeType" && searchSlug) {
      const recipeType = await db.recipeTypes.findFirst({
        where: { isPublished: true, slug: searchSlug },
        select: { id: true },
      });

      if (!recipeType) return [];
      where.recipeRecipeType = { some: { recipeTypeId: recipeType.id } };
    }

    if (searchType === "season" && searchSlug) {
      const season = await db.recipeSeasons.findFirst({
        where: { title: { equals: searchSlug } },
        select: { id: true },
      });

      if (!season) return [];
      where.OR = [
        { recipeSeasonsId: season.id },
        { recipeSeasonTags: { some: { recipeSeasonsId: season.id } } },
      ];
      if (searchSlug.toLowerCase() === "summer") {
        where.RecipeCategories = { slug: { in: ["veg", "vegan"] } };
      }
    }

    if (searchType === "ingredient" && searchSlug) {
      const ingredient = await db.ingredients.findFirst({
        where: {
          OR: [
            { slug: searchSlug },
            { name: { contains: searchSlug } },
          ],
        },
        select: { id: true },
      });

      if (!ingredient) return [];
      where.recipeIngredients = { some: { ingredientId: ingredient.id } };
    }

    if (foodPreferenceSlug && searchType !== "category") {
      const foodPreference = await db.recipeCategories.findFirst({
        where: { isPublished: true, slug: foodPreferenceSlug },
        select: { id: true },
      });

      if (!foodPreference) return [];
      where.recipeCategoriesId = foodPreference.id;
    }

    return await db.recipes.findMany({
      where,
      include: recipeInclude,
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("[GET_RECIPES]", error);
    return [];
  }
};
