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
    const allRecipes = await GetRecipes({});
    let candidateRecipes = allRecipes;

    if (userId) {
      const filteredRecipes = await filterRecipesByUserPreferences(userId).catch(
        () => [],
      );
      if (filteredRecipes.length > 0) {
        candidateRecipes = filteredRecipes;
      }
    }

    const hasBehaviorData =
      Object.keys(behaviorData).length > 0 ||
      Object.keys(categoryData).length > 0;
    const recommendations = hasBehaviorData
      ? getRecommendationsBasedOnBehavior(
          candidateRecipes,
          behaviorData,
          categoryData,
        )
      : candidateRecipes;
    const withoutCurrent = recommendations.filter(
      (recipe) => recipe.id !== recipeId,
    );

    if (withoutCurrent.length > 0) {
      return withoutCurrent;
    }

    return allRecipes.filter((recipe) => recipe.id !== recipeId);
  } catch (error) {
    console.error("[GET_RELATED_RECIPES]", error);
    return [];
  }
};
