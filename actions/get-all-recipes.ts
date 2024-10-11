"use server";

import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";

export const getRecipes = async (): Promise<RecipeWithCategory[]> => {
  try {
    const recipes = await db.recipes.findMany({
      include: {
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
        recipePrakriti: {
          include: {
            prakriti: true,
          },
        },
        recipeHealthGoals: {
          include: {
            healthGoals: true,
          },
        },
        recipeCookingTime: true,
        recipeMealTime: true,
        recipeDifficulty: true,
        recipeSeasons: true,
        Review: true,
        recipeComments: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    return recipes;
  } catch (error) {
    console.error("[GET_ALL_RECIPES]", error);
    return [];
  }
};
