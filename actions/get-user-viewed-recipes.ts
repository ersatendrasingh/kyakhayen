"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RecipeWithCategory } from "@/types/recipe";

export const getUserViewedRecipes = async (): Promise<RecipeWithCategory[]> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const userId = user.id;

    const views = await db.userRecipeViews.findMany({
      where: {
        userId,
      },
      include: {
        recipe: {
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
            Review: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!views) {
      throw new Error(
        `Views not found on any recipe for user with ID ${userId}.`
      );
    }

    const viewedRecipes = views.map((view) => view.recipe);

    return viewedRecipes;
  } catch (error) {
    console.error("Error fetching user's viewed recipes:", error);
    throw error;
  }
};
