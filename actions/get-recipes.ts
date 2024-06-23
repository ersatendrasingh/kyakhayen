"use server";

import { db } from "@/lib/db";

import { RecipeWithCategory } from "@/types/recipe";

type GetRecipes = {
  title?: string;
  searchSlug?: string;
  searchType?: string;
};

export const GetRecipes = async ({
  title,
  searchSlug,
  searchType,
}: GetRecipes): Promise<RecipeWithCategory[]> => {
  try {
    let recipes;
    if (searchType && searchType === "category") {
      const recipeCategories = await db.recipeCategories.findFirst({
        where: {
          slug: searchSlug,
        },
      });

      recipes = await db.recipes.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeCategoriesId: recipeCategories?.id,
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
          recipeMealTime: true,

          recipeDifficulty: true,
          recipeSeasons: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (searchType && searchType === "mealTime") {
      const recipeMealTime = await db.mealTimes.findFirst({
        where: {
          slug: searchSlug,
        },
      });

      recipes = await db.recipes.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeMealTime: {
            some: { mealTimeId: recipeMealTime?.id },
          },
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
          recipeMealTime: true,

          recipeDifficulty: true,
          recipeSeasons: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else {
      // Handle case when neither category nor mealtime is provided
      recipes = await db.recipes.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
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
          recipeMealTime: true,
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
          updatedAt: "desc",
        },
      });
    }

    return recipes;
  } catch (error) {
    console.error("[GET_RECIPES]", error);
    return [];
  }
};
