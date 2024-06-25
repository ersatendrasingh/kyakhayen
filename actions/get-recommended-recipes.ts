"use server";

import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";
import { getRecommendations } from "@/lib/getRecommendations";
import { RecipeWithCategory } from "@/types/recipe";

const PAGE_SIZE = 8; // Define the number of recipes per page

export const getRecommendedRecipes = async (
  page: number = 1
): Promise<{ recipes: RecipeWithCategory[]; hasMore: boolean }> => {
  try {
    // Fetch all recipes and filter based on user preferences
    const allRecipes = await filterRecipesByUserPreferences();

    // Generate recommendations based on filtered recipes with pagination
    const recommendations = getRecommendations(allRecipes, page, PAGE_SIZE);

    // Determine if there are more recipes to load
    const hasMore = page * PAGE_SIZE < allRecipes.length;

    return { recipes: recommendations, hasMore };
  } catch (error) {
    console.error("Error fetching recommended recipes:", error);
    throw error;
  }
};
