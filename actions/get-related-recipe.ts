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
    if (
      userId &&
      (Object.keys(behaviorData).length > 0 ||
        Object.keys(categoryData).length > 0)
    ) {
      // Filter all recipes based on user preferences
      const filteredRecipes = await filterRecipesByUserPreferences(userId);

      // Apply behavior and category-based filtering
      relatedRecommendedRecipes = getRecommendationsBasedOnBehavior(
        filteredRecipes,
        behaviorData,
        categoryData
      );
    } else if (
      (!userId && Object.keys(behaviorData).length > 0) ||
      Object.keys(categoryData).length > 0
    ) {
      const allRecipes = await GetRecipes({});
      relatedRecommendedRecipes = getRecommendationsBasedOnBehavior(
        allRecipes,
        behaviorData,
        categoryData
      );
    } else {
      // Fallback: Fetch popular recipes if no behavior data exists or user is not logged in
      relatedRecommendedRecipes = await GetRecipes({});
    }

    return relatedRecommendedRecipes.filter((recipe) => recipe.id !== recipeId);
  } catch (error) {
    console.error("[GET_RELATED_RECIPES]", error);
    return [];
  }
};
