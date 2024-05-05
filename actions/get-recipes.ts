import {
  CookingMethods,
  Cuisines,
  DietTypes,
  Nutrient,
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeMethods,
  RecipeNutritionValues,
  RecipeSeasons,
  Recipes,
  Units,
} from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type RecipeIngredients = {
  id: string;
  name: string;
  quantity: number;
  position: number;
  recipeId: string;
  unitId: string;
  notes?: string | null;
  unit: Units;
};

type RecipeCookingMethod = {
  id: string;
  cookingMethodId: string;
  recipeId: string;
  cookingMethod: CookingMethods;
};

type RecipeCuisines = {
  id: string;
  cuisineId: string;
  recipeId: string;
  cuisine: Cuisines;
};

type RecipeDietType = {
  id: string;
  dietTypeId: string;
  recipeId: string;
  dietType: DietTypes;
};
type RecipeNutrient = {
  id: string;
  recipeId: string;
  nutrientId: string;
  nutrient: Nutrient;
};

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeIngredients: RecipeIngredients[];
  recipeMethods: RecipeMethods[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeNutritionValues: RecipeNutritionValues | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
  recipeCookingMethods: RecipeCookingMethod[] | null;
  recipeCuisine: RecipeCuisines[] | null;
  recipeDietType: RecipeDietType[] | null;
  recipeNutrient: RecipeNutrient[] | null;
};

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
            include: {
              dietType: true,
            },
          },
          recipeNutrient: {
            include: {
              nutrient: true,
            },
          },
          recipeCookingTime: true,
          recipeNutritionValues: true,
          recipeDifficulty: true,
          recipeSeasons: true,
        },
        orderBy: {
          createdAt: "desc",
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
            include: {
              dietType: true,
            },
          },
          recipeNutrient: {
            include: {
              nutrient: true,
            },
          },
          recipeCookingTime: true,
          recipeNutritionValues: true,
          recipeDifficulty: true,
          recipeSeasons: true,
        },
        orderBy: {
          createdAt: "desc",
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
            include: {
              dietType: true,
            },
          },
          recipeNutrient: {
            include: {
              nutrient: true,
            },
          },
          recipeCookingTime: true,
          recipeNutritionValues: true,
          recipeDifficulty: true,
          recipeSeasons: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return recipes;
  } catch (error) {
    console.error("[GET_RECIPES]", error);
    return [];
  }
};
