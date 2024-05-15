"use server";

import { db } from "@/lib/db";

import { RecipeWithCategory } from "@/types/recipe";

type GetSearchedRecipes = {
  k?: string;
};

export const GetSearchedRecipes = async ({
  k,
}: GetSearchedRecipes): Promise<RecipeWithCategory[]> => {
  try {
    if (!k) return [];

    const recipes = await db.recipes.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            RecipeCategories: {
              name: {
                contains: k,
              },
            },
          },
          {
            recipeMealTime: {
              some: {
                mealTime: {
                  title: {
                    contains: k,
                  },
                },
              },
            },
          },
          {
            recipeCuisine: {
              some: {
                cuisine: {
                  title: {
                    contains: k,
                  },
                },
              },
            },
          },

          {
            recipeDietType: {
              some: {
                dietType: {
                  title: {
                    contains: k,
                  },
                },
              },
            },
          },
          {
            recipeRecipeType: {
              some: {
                recipeType: {
                  title: {
                    contains: k,
                  },
                },
              },
            },
          },
          {
            recipeSeasons: {
              title: {
                contains: k,
              },
            },
          },
          {
            title: {
              contains: k,
            },
          },
        ],
      },
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
        recipeCookingTime: true,

        recipeDifficulty: true,
        recipeSeasons: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return recipes;
  } catch (error) {
    console.error("[GET_RECIPES]", error);
    return [];
  }
};
