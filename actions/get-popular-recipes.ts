"use server";

import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";

type GetRecipes = {
  title?: string;
  searchSlug?: string;
  searchType?: "category" | "mealTime";
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE = 8; // Default page size

export const getPopularRecipes = async ({
  title,
  searchSlug,
  searchType,
  page = 1,
  pageSize = PAGE_SIZE,
}: GetRecipes): Promise<{
  recipes: RecipeWithCategory[];
  hasMore: boolean;
}> => {
  try {
    let whereClause: any = { isPublished: true };

    if (title) {
      whereClause.title = {
        contains: title,
      };
    }

    if (searchType && searchSlug) {
      if (searchType === "category") {
        const category = await db.recipeCategories.findFirst({
          where: { slug: searchSlug },
        });

        if (category?.id) {
          whereClause.recipeCategoriesId = category.id;
        }
      } else if (searchType === "mealTime") {
        const mealTime = await db.mealTimes.findFirst({
          where: { slug: searchSlug },
        });

        if (mealTime?.id) {
          whereClause.recipeMealTime = {
            some: { mealTimeId: mealTime.id },
          };
        }
      }
    }

    // Fetch the total count of recipes
    const totalRecipesCount = await db.recipes.count({
      where: whereClause,
    });

    // Fetch the recipes with pagination
    const recipes = await db.recipes.findMany({
      where: whereClause,
      include: {
        RecipeCategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            position: true,
          },
        },
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
          orderBy: {
            position: "asc",
          },
        },
        recipeMethods: {
          orderBy: {
            position: "asc",
          },
        },
        recipeHealthBenefits: {
          orderBy: {
            position: "asc",
          },
        },
        recipeCookingMethods: {
          include: {
            cookingMethod: true,
          },
        },
        recipeCuisine: {
          include: {
            cuisine: true,
          },
        },
        recipeDietType: {
          include: {
            dietType: true,
          },
        },
        recipeRecipeType: {
          include: {
            recipeType: true,
          },
        },
        recipeNutrient: {
          include: {
            nutrient: true,
          },
        },
        recipeCookingTime: true,
        recipeMealTime: true,
        recipeDifficulty: true,
        recipeSeasons: true,
        Review: true, // Include Review to match the RecipeWithCategory type
        recipeComments: true, // Include recipeComments to match the RecipeWithCategory type
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const hasMore = page * pageSize < totalRecipesCount;

    return { recipes, hasMore };
  } catch (error) {
    console.error("[GET_RECIPES_ERROR]", error);
    return { recipes: [], hasMore: false };
  }
};
