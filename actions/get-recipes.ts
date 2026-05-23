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
          isPublished: true,
          slug:
            searchSlug === "egg"
              ? { in: ["eggetarian", "egg"] }
              : searchSlug,
        },
      });

      if (!recipeCategories) {
        return [];
      }

      recipes = await db.recipes.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeCategoriesId: recipeCategories.id,
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
            where: {
              dietType: {
                isPublished: true,
              },
            },
            include: {
              dietType: true,
            },
          },
          recipeRecipeType: {
            where: {
              recipeType: {
                isPublished: true,
              },
            },
            include: {
              recipeType: true,
            },
          },
          recipeNutrient: {
            where: {
              nutrient: {
                isPublished: true,
              },
            },
            include: {
              nutrient: true,
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
          updatedAt: "desc",
        },
      });
    } else if (searchType && searchType === "mealTime") {
      const recipeMealTime = await db.mealTimes.findFirst({
        where: {
          isPublished: true,
          slug: searchSlug,
        },
      });

      if (!recipeMealTime) {
        return [];
      }

      recipes = await db.recipes.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeMealTime: {
            some: { mealTimeId: recipeMealTime.id },
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
            where: {
              dietType: {
                isPublished: true,
              },
            },
            include: {
              dietType: true,
            },
          },
          recipeRecipeType: {
            where: {
              recipeType: {
                isPublished: true,
              },
            },
            include: {
              recipeType: true,
            },
          },
          recipeNutrient: {
            where: {
              nutrient: {
                isPublished: true,
              },
            },
            include: {
              nutrient: true,
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
            where: {
              dietType: {
                isPublished: true,
              },
            },
            include: {
              dietType: true,
            },
          },
          recipeRecipeType: {
            where: {
              recipeType: {
                isPublished: true,
              },
            },
            include: {
              recipeType: true,
            },
          },
          recipeNutrient: {
            where: {
              nutrient: {
                isPublished: true,
              },
            },
            include: {
              nutrient: true,
            },
          },
          recipeCookingTime: true,

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
