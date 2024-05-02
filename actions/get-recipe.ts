import {
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeMethods,
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
type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeIngredients: RecipeIngredients[];
  recipeMethods: RecipeMethods[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
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
        recipeCookingTime: true,
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
