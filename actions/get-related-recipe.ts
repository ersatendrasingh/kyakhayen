import { db } from "@/lib/db";

import { RecipeWithCategory } from "@/types/recipe";

type GetRecipes = {
  title?: string;
  searchSlug?: string;
  categoryId?: string;
};

export const GetRelatedRecipes = async ({
  title,
  searchSlug,
  categoryId,
}: GetRecipes): Promise<RecipeWithCategory[]> => {
  try {
    let recipes;

    recipes = await db.recipes.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        NOT: {
          slug: searchSlug,
        },
        recipeCategoriesId: {
          contains: categoryId,
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
