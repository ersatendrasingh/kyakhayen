import { RecipeWithCategory } from "@/types/recipe";
import { currentUser } from "@/lib/auth";
import { GetRecipes } from "@/actions/get-recipes";
import { db } from "@/lib/db";
import { filterRecipesBySeason } from "./filterBySeason";

export const filterRecipesByUserPreferences = async (): Promise<
  RecipeWithCategory[]
> => {
  try {
    // Get current user
    const user = await currentUser();
    const userId = user?.id;

    // Fetch user data if user is logged in
    let userData: any = null;
    if (userId) {
      userData = await db.user.findUnique({
        where: { id: userId },
        include: {
          userCuisines: true,
          UserAllrgies: true, // Corrected typo here
          UserHealthGoals: true,
          // Add more includes as needed
        },
      });

      if (!userData) {
        throw new Error(`User with ID ${userId} not found.`);
      }
    }

    const currentMonth = new Date().getMonth() + 1;

    // Fetch all recipes
    const allRecipes = await GetRecipes({});

    // Fetch all recipe categories and create a category map
    const recipeCategories = await db.recipeCategories.findMany();
    const categoryMap = recipeCategories.reduce((map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    }, {} as { [key: string]: string });

    // Filter recipes based on user preferences
    const filteredRecipes = allRecipes.filter((recipe) => {
      // Check if recipe matches user's food preferences
      const matchesFoodPreference = (() => {
        if (userData) {
          switch (userData.foodPreferenceId) {
            case categoryMap["non veg"]:
              return true; // Non-veg users can eat all types of food
            case categoryMap["veg"]:
              return recipe.recipeCategoriesId === categoryMap["veg"];
            case categoryMap["egg"]:
              return (
                recipe.recipeCategoriesId === categoryMap["veg"] ||
                recipe.recipeCategoriesId === categoryMap["egg"]
              );
            case categoryMap["pescetarian"]:
              return (
                recipe.recipeCategoriesId === categoryMap["veg"] ||
                recipe.recipeCategoriesId === categoryMap["pescetarian"]
              );
            case categoryMap["vegan"]:
              return recipe.recipeCategoriesId === categoryMap["vegan"];
            default:
              return false;
          }
        } else {
          return true; // No user logged in, return all recipes
        }
      })();

      return matchesFoodPreference;
    });

    // Log and return filtered recipes
    const filteredRecipesBySeason = await filterRecipesBySeason(
      filteredRecipes,
      currentMonth
    );

    return filteredRecipesBySeason;
  } catch (error) {
    console.error("[filterRecipesByUserPreferences] Error:", error);
    throw error;
  }
};
