"use server";

import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";
import { getRecommendations } from "@/lib/recipeRecommendations";
import { RecipeWithCategory } from "@/types/recipe";

const PAGE_SIZE = 8; // Define the number of recipes per page

export const getRecommendedRecipes = async (
  page: number = 1
): Promise<RecipeWithCategory[]> => {
  try {
    // Fetch all recipes and filter based on user preferences
    const allRecipes = await filterRecipesByUserPreferences();

    // Generate recommendations based on filtered recipes with pagination
    const recommendations = getRecommendations(allRecipes, page, PAGE_SIZE);

    return recommendations;
  } catch (error) {
    console.error("Error fetching recommended recipes:", error);
    throw error;
  }
};
