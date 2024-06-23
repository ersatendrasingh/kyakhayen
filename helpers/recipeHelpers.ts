// recipeHelpers.ts

import { MealTimes } from "@prisma/client";
import { RecipeWithCategory } from "@/types/recipe";

// Function to assign a unique recipe of a specific type to a meal time
const assignUniqueRecipeByType = (
  type: string,
  mealTime: MealTimes,
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  mealsByTime: { [key: string]: RecipeWithCategory[] },
  recentRecipeIds: Set<string>,
  fallback: boolean = false,
  excludeRecipeIds: string[] = []
) => {
  if (categorizedRecipes[type]?.length > 0) {
    const recipesOfType = categorizedRecipes[type];

    // Filter recipes that haven't been recently used and aren't excluded
    const availableRecipes = recipesOfType.filter(
      (recipe) =>
        (!fallback || !recentRecipeIds.has(recipe.id)) &&
        !excludeRecipeIds.includes(recipe.id) &&
        recipe.recipeMealTime?.some((mt) => mt.mealTimeId === mealTime.id)
    );

    if (availableRecipes.length > 0) {
      // Choose a random recipe from available ones
      const randomIndex = Math.floor(Math.random() * availableRecipes.length);
      const selectedRecipe = availableRecipes[randomIndex];

      mealsByTime[mealTime.slug].push(selectedRecipe);
      recentRecipeIds.add(selectedRecipe.id); // Track recently used recipe

      // If this assignment is for dinner, add this recipe to exclude list for dinner
      if (mealTime.title === "Dinner") {
        excludeRecipeIds.push(selectedRecipe.id);
      }
    }
  }
};
export const assignRecipesToMealTimes = (
  mealTimes: MealTimes[],
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  recentRecipeIds: Set<string>
): { [key: string]: RecipeWithCategory[] } => {
  const mealsByTime: { [key: string]: RecipeWithCategory[] } = {};

  try {
    mealTimes.forEach((time) => {
      mealsByTime[time.slug] = [];

      switch (time.title) {
        case "Breakfast":
          assignUniqueRecipeByType(
            "Main Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Side Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          break;

        case "Mid Morning":
          assignUniqueRecipeByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Snacks",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Beverage/Smoothie",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          break;

        case "Lunch":
          assignUniqueRecipeByType(
            "Vegetable Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Bread/Roti",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Vegetable Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Rice",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          ); // Rice is optional
          assignUniqueRecipeByType(
            "Dessert",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          ); // Dessert is optional
          break;

        case "Evening":
          assignUniqueRecipeByType(
            "Snacks",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          assignUniqueRecipeByType(
            "Fruit",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds
          );
          break;

        case "Dinner":
          // For dinner, pass lunch recipes as usedRecipeIds to exclude them
          const lunchRecipes = mealsByTime["lunch"] || [];
          const usedRecipeIds = lunchRecipes.map((recipe) => recipe.id);

          assignUniqueRecipeByType(
            "Vegetable Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            false,
            usedRecipeIds
          );
          assignUniqueRecipeByType(
            "Bread/Roti",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            false,
            usedRecipeIds
          );
          assignUniqueRecipeByType(
            "Vegetable Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            false,
            usedRecipeIds
          );
          assignUniqueRecipeByType(
            "Rice",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true,
            usedRecipeIds
          ); // Rice is optional
          assignUniqueRecipeByType(
            "Dessert",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true,
            usedRecipeIds
          ); // Dessert is optional
          break;

        default:
          console.log(`No specific logic for ${time.title}`);
          break;
      }
    });
  } catch (error) {
    console.error("Error assigning recipes to meal times:", error);
  }

  return mealsByTime;
};
