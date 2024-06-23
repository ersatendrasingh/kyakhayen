"use server";
import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";

import { assignRecipesToMealTimes } from "@/helpers/recipeHelpers";
import { GetRecipes } from "@/actions/get-recipes";
import { addRecentRecipe, getRecentRecipes } from "@/store/recentRecipesStore";

export const generateRecipesForDate = async (
  userId: string,
  date: Date
): Promise<{ [key: string]: RecipeWithCategory[] } | null> => {
  try {
    // Fetch user details including preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userCuisines: true,
        UserAllrgies: true,
        UserHealthGoals: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Fetch meal times (assuming predefined meal times in the database)
    const mealTimes = await db.mealTimes.findMany();

    // Fetch all published recipes with their details
    const allRecipes = await GetRecipes({});

    // Fetch recipe categories
    const recipeCategories = await db.recipeCategories.findMany();

    // Create a mapping from category names to their IDs
    const categoryMap = recipeCategories.reduce((map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    }, {} as { [key: string]: string });

    // Fetch recently used recipes
    const recentRecipeIds = new Set<string>(getRecentRecipes(userId, 6)); // Fetch recipes used in the last 6 days

    // Filter recipes based on user preferences
    const filteredRecipes = allRecipes.filter((recipe) => {
      const matchesFoodPreference = (() => {
        switch (user.foodPreferenceId) {
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
      })();

      return matchesFoodPreference;
    });

    // Categorize recipes based on their types dynamically
    const categorizedRecipes: { [key: string]: RecipeWithCategory[] } = {};
    filteredRecipes.forEach((recipe) => {
      recipe.recipeRecipeType?.forEach((rt) => {
        const type = rt.recipeType.title;
        if (!categorizedRecipes[type]) {
          categorizedRecipes[type] = [];
        }
        categorizedRecipes[type].push(recipe);
      });
    });

    // Shuffle arrays to ensure randomness
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    Object.keys(categorizedRecipes).forEach((type) =>
      shuffleArray(categorizedRecipes[type])
    );

    // Assign recipes to meal times
    const mealsByTime = assignRecipesToMealTimes(
      mealTimes,
      categorizedRecipes,
      recentRecipeIds
    );

    // Save the assigned recipes in the in-memory store
    for (const mealTimeSlug in mealsByTime) {
      const mealRecipes = mealsByTime[mealTimeSlug];
      for (const recipe of mealRecipes) {
        addRecentRecipe(userId, date, recipe.id);
      }
    }

    // Return recipes for the given date
    return mealsByTime;
  } catch (error) {
    console.error("Error generating recipes for date:", error);
    // Return null or an empty object as appropriate
    return null;
  }
};
