import { RecipeWithCategory } from "@/types/recipe";

import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";
import { getRecommendationsBasedOnBehavior } from "./get-recommendations-based-on-behavior";
import { GetRecipes } from "./get-recipes";

type GetRecipesParams = {
  recipeId: string;
  userId: string | undefined;
  behaviorData: Record<string, number>;
  categoryData: Record<string, number>;
};

export const getRelatedRecipes = async ({
  recipeId,
  userId,
  behaviorData,
  categoryData,
}: GetRecipesParams): Promise<RecipeWithCategory[]> => {
  try {
    let relatedRecommendedRecipes: RecipeWithCategory[] = [];

    // Case 1: User is logged in but has no behavior data or category data
    if (
      userId &&
      Object.keys(behaviorData).length === 0 &&
      Object.keys(categoryData).length === 0
    ) {
      const filteredRecipes = await filterRecipesByUserPreferences(userId);
      relatedRecommendedRecipes =
        filteredRecipes.length > 0 ? filteredRecipes : await GetRecipes({});
    }

    // Case 2: User is logged in and has both behavior data and category data
    else if (
      userId &&
      Object.keys(behaviorData).length > 0 &&
      Object.keys(categoryData).length > 0
    ) {
      const filteredRecipes = await filterRecipesByUserPreferences(userId);
      relatedRecommendedRecipes = getRecommendationsBasedOnBehavior(
        filteredRecipes,
        behaviorData,
        categoryData
      );
    }

    // Case 3: Visitor with behavior data
    else if (
      !userId &&
      (Object.keys(behaviorData).length > 0 ||
        Object.keys(categoryData).length > 0)
    ) {
      const allRecipes = await GetRecipes({});
      relatedRecommendedRecipes = getRecommendationsBasedOnBehavior(
        allRecipes,
        behaviorData,
        categoryData
      );
    }

    // Case 4: Visitor without any data
    else {
      relatedRecommendedRecipes = await GetRecipes({});
    }

    return relatedRecommendedRecipes.filter((recipe) => recipe.id !== recipeId);
  } catch (error) {
    console.error("[GET_RELATED_RECIPES]", error);
    return [];
  }
};
