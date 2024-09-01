"use server";

import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";
import { RecipeWithCategory } from "@/types/recipe";
import { getRecommendationsBasedOnBehavior } from "@/actions/get-recommendations-based-on-behavior";
import { getRecommendations } from "@/lib/getRecommendations";
import { GetRecipes } from "./get-recipes";

const PAGE_SIZE = 8; // Define the number of recipes per page

export const getRecommendedRecipes = async (
  page: number = 1,
  userId: string,
  behaviorData: Record<string, number>,
  categoryData: Record<string, number>
): Promise<{ recipes: RecipeWithCategory[]; hasMore: boolean }> => {
  try {
    let recommendedRecipes: RecipeWithCategory[] = [];
    if (
      userId &&
      (Object.keys(behaviorData).length > 0 ||
        Object.keys(categoryData).length > 0)
    ) {
      // Filter all recipes based on user preferences
      const filteredRecipes = await filterRecipesByUserPreferences(userId);

      // Apply behavior and category-based filtering
      recommendedRecipes = getRecommendationsBasedOnBehavior(
        filteredRecipes,
        behaviorData,
        categoryData
      );
    } else if (
      (!userId && Object.keys(behaviorData).length > 0) ||
      Object.keys(categoryData).length > 0
    ) {
      const allRecipes = await GetRecipes({});
      recommendedRecipes = getRecommendationsBasedOnBehavior(
        allRecipes,
        behaviorData,
        categoryData
      );
    } else {
      // Fallback: Fetch popular recipes if no behavior data exists or user is not logged in
      recommendedRecipes = await GetRecipes({});
    }

    // Further refine recommendations using TF-IDF and cosine similarity
    const finalRecommendations = getRecommendations(
      recommendedRecipes,
      page,
      PAGE_SIZE
    );

    // Determine if there are more recipes to load
    const hasMore = page * PAGE_SIZE < recommendedRecipes.length;

    return { recipes: finalRecommendations, hasMore };
  } catch (error) {
    console.error("Error fetching recommended recipes:", error);
    throw error;
  }
};
