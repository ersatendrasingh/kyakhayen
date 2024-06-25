import { RecipeWithCategory } from "@/types/recipe";
import { getRelatedRecommendations } from "@/lib/get-related-recipes";
import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";

type GetRecipesParams = {
  recipeId: string;
};

export const getRelatedRecipes = async ({
  recipeId,
}: GetRecipesParams): Promise<RecipeWithCategory[]> => {
  try {
    // Logic to fetch related recipes based on recipeId
    const allRecipes = await filterRecipesByUserPreferences();

    const relatedRecommendations = getRelatedRecommendations(
      allRecipes,
      recipeId
    );

    return relatedRecommendations;
  } catch (error) {
    console.error("[GET_RELATED_RECIPES]", error);
    return [];
  }
};
