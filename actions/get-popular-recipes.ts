"use server";

import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";

type GetRecipes = {
  title?: string;
  searchSlug?: string;
  searchType?: string;
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
    let recipes;
    let totalRecipesCount;

    if (searchType && searchType === "category") {
      const recipeCategories = await db.recipeCategories.findFirst({
        where: {
          slug: searchSlug,
        },
      });

      totalRecipesCount = await db.recipes.count({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeCategoriesId: recipeCategories?.id,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else if (searchType && searchType === "mealTime") {
      const recipeMealTime = await db.mealTimes.findFirst({
        where: {
          slug: searchSlug,
        },
      });

      totalRecipesCount = await db.recipes.count({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          recipeMealTime: {
            some: { mealTimeId: recipeMealTime?.id },
          },
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else {
      totalRecipesCount = await db.recipes.count({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
        },
      });

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
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }

    const hasMore = page * pageSize < totalRecipesCount;

    return { recipes, hasMore };
  } catch (error) {
    console.error("[GET_RECIPES]", error);
    return { recipes: [], hasMore: false };
  }
};
