// recipeHelpers.ts
import { MealTimes } from "@prisma/client";
import { RecipeWithCategory } from "@/types/recipe";

export const assignRecipesByType = (
  type: string,
  mealTime: MealTimes,
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  mealsByTime: { [key: string]: RecipeWithCategory[] },
  recentRecipeIds: Set<string>,
  fallback: boolean = false
) => {
  if (categorizedRecipes[type]?.length > 0) {
    const recipesOfType = categorizedRecipes[type];

    // Find the first recipe that hasn't been used yet and is appropriate for the meal time
    const availableRecipe = recipesOfType.find(
      (recipe) =>
        (!fallback || !recentRecipeIds.has(recipe.id)) &&
        recipe.recipeMealTime?.some((mt) => mt.mealTimeId === mealTime.id)
    );

    if (availableRecipe) {
      mealsByTime[mealTime.slug].push(availableRecipe);
    } else if (fallback) {
      // If fallback is true, use any recipe available
      mealsByTime[mealTime.slug].push(recipesOfType[0]);
    }
  }
};

export const assignRecipesToMealTimes = (
  mealTimes: MealTimes[],
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  recentRecipeIds: Set<string>
): { [key: string]: RecipeWithCategory[] } => {
  const mealsByTime: { [key: string]: RecipeWithCategory[] } = {};

  mealTimes.forEach((time) => {
    mealsByTime[time.slug] = [];

    switch (time.title) {
      case "Breakfast":
        assignRecipesByType(
          "Main Dish",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Side Dish",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        break;
      case "Mid Morning":
        assignRecipesByType(
          "Fruit Salad",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Snacks",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Beverage/Smoothie",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        break;
      case "Lunch":
        assignRecipesByType(
          "Meal",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Grains",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Dessert",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        break;
      case "Evening":
        assignRecipesByType(
          "Snacks",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Fruit Salad",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Fruit",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        break;
      case "Dinner":
        assignRecipesByType(
          "Meal",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Grains",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        assignRecipesByType(
          "Dessert",
          time,
          categorizedRecipes,
          mealsByTime,
          recentRecipeIds
        );
        break;
      default:
        console.log(`No specific logic for ${time.title}`);
        break;
    }

    // Fallback to recently used recipes if no recipes were assigned
    if (mealsByTime[time.slug].length === 0) {
      switch (time.title) {
        case "Breakfast":
          assignRecipesByType(
            "Main Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Side Dish",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          break;
        case "Mid Morning":
          assignRecipesByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Snacks",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Beverage/Smoothie",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          break;
        case "Lunch":
          assignRecipesByType(
            "Meal",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Grains",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Dessert",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          break;
        case "Evening":
          assignRecipesByType(
            "Snacks",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Fruit",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          break;
        case "Dinner":
          assignRecipesByType(
            "Meal",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Grains",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          assignRecipesByType(
            "Dessert",
            time,
            categorizedRecipes,
            mealsByTime,
            recentRecipeIds,
            true
          );
          break;
        default:
          console.log(`No specific logic for ${time.title}`);
          break;
      }
    }
  });

  return mealsByTime;
};
