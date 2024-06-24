// filterBySeason.ts

import { RecipeWithCategory } from "@/types/recipe";
import { getSeasonById } from "@/lib/getSeasonById";

export const filterRecipesBySeason = async (
  recipes: RecipeWithCategory[],
  currentMonth: number // Current month as 1-based index
): Promise<RecipeWithCategory[]> => {
  try {
    const filteredRecipes: RecipeWithCategory[] = [];

    for (const recipe of recipes) {
      if (!recipe.recipeSeasonsId) {
        filteredRecipes.push(recipe); // No specific season, include the recipe
      } else {
        // Fetch the season details using recipe.recipeSeasonsId
        const season = await getSeasonById(recipe.recipeSeasonsId);

        if (!season) {
          continue; // Season details not found, skip this recipe
        }

        // Check if the recipe matches the current season
        if (
          season.title.toLowerCase().includes("suitable throughout the year") ||
          (currentMonth >= (season.startMonth || 1) &&
            currentMonth <= (season.endMonth || 12))
        ) {
          filteredRecipes.push(recipe); // Include recipe if it matches the current season
        }
      }
    }

    return filteredRecipes;
  } catch (error) {
    console.error("[filterRecipesBySeason] Error:", error);
    throw error;
  }
};
