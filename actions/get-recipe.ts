import {
  CookingMethods,
  Cuisines,
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
};

export const getRecipeBySlug = async ({
  recipeSlug,
}: {
  recipeSlug?: string;
}): Promise<RecipeWithCategory | null> => {
  try {
    if (recipeSlug === undefined) {
      throw new Error("Recipe slug is required");
    }

    const user = await currentUser();
    const userId: string | undefined = user?.id;

    const recipe = await db.recipes.findFirst({
      where: {
        isPublished: true,
        slug: recipeSlug,
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
        recipeCookingTime: true,
        recipeNutritionValues: true,
        recipeDifficulty: true,
        recipeSeasons: true,
      },
    });

    if (!recipe) {
      return null;
    }
    const recipeWithDecimalQuantity: RecipeWithCategory = {
      ...recipe,
      recipeIngredients: recipe.recipeIngredients.map((ingredient) => ({
        ...ingredient,
        quantity: +ingredient.quantity,
      })),
    };
    return recipeWithDecimalQuantity;
  } catch (error) {
    console.log("[GET_RECIPE_BY_SLUG]", error);
    return null;
  }
};
