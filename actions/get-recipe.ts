"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RecipeWithCategory } from "@/types/recipe";

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
          where: {
            isPublished: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        recipeHealthBenefits: {
          orderBy: {
            position: "asc",
          },
        },
        recipeRecipeType: {
          include: {
            recipeType: true,
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
        recipeMealTime: true,
        recipeDifficulty: true,
        recipeSeasons: true,
        recipeComments: {
          where: {
            OR: [{ isPublished: true }, { userId }],
          },
          include: {
            user: true,
            recipe: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
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
