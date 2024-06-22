"use server";
import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";
import { MealTimes } from "@prisma/client";

// Function to generate recipes for a given date based on user preferences
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
    const allRecipes = await db.recipes.findMany({
      where: { isPublished: true },
      include: {
        RecipeCategories: true,
        recipeIngredients: {
          include: {
            unit: true,
            ingredientForm: true,
            ingredient: { include: { IngredientUnitMeasurements: true } },
          },
          orderBy: { position: "asc" },
        },
        recipeMethods: { orderBy: { position: "asc" } },
        recipeHealthBenefits: { orderBy: { position: "asc" } },
        recipeCookingMethods: { include: { cookingMethod: true } },
        recipeCuisine: { include: { cuisine: true } },
        recipeDietType: { include: { dietType: true } },
        recipeRecipeType: { include: { recipeType: true } },
        recipeNutrient: { include: { nutrient: true } },
        recipeHealthGoals: { include: { healthGoals: true } },
        recipeCookingTime: true,
        recipeDifficulty: true,
        recipeSeasons: true,
        recipePrakriti: true, // Include the recipePrakriti relation
        recipeMealTime: true, // Include the recipeMealTimes relation
      },
    });

    // Filter recipes based on user preferences
    const filteredRecipes = allRecipes.filter((recipe) => {
      const matchesCuisine = user.userCuisines.some((uc) =>
        recipe.recipeCuisine.some((rc) => rc.cuisineId === uc.cuisineId)
      );

      const matchesAllergies = user.UserAllrgies.every(
        (ua) =>
          !recipe.recipeIngredients.some(
            (ri) => ri.ingredientId === ua.allergyId
          )
      );

      const matchesHealthGoals = user.UserHealthGoals.some((uhg) =>
        recipe.recipeHealthGoals.some(
          (rhb) => rhb.healthGoalId === uhg.healthGoalId
        )
      );

      const matchesFoodPreference =
        recipe.recipeCategoriesId === user.foodPreferenceId;

      const matchesCookingSkill =
        recipe.recipeDifficultyId === user.cookingSkillId;

      const matchesPrakriti = recipe.recipePrakriti.some(
        (rp) => rp.prakritiId === user.prakritiId
      );

      return (
        //matchesCuisine &&
        //matchesAllergies &&
        //matchesHealthGoals &&
        matchesFoodPreference
        //matchesCookingSkill &&
        //matchesPrakriti
      );
    });

    // Categorize recipes based on their types dynamically
    const categorizedRecipes: { [key: string]: RecipeWithCategory[] } = {};
    filteredRecipes.forEach((recipe) => {
      recipe.recipeRecipeType.forEach((rt) => {
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
    const mealsByTime: { [key: string]: RecipeWithCategory[] } = {};

    mealTimes.forEach((time) => {
      mealsByTime[time.slug] = [];

      switch (time.title) {
        case "Breakfast":
          console.log("Assigning Breakfast recipes");
          assignRecipesByType(
            "Main Dish",
            time,
            categorizedRecipes,
            mealsByTime
          );
          assignRecipesByType(
            "Side Dish",
            time,
            categorizedRecipes,
            mealsByTime
          );
          break;

        case "Mid Morning":
          console.log("Assigning Mid Morning recipes");
          assignRecipesByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime
          );
          assignRecipesByType("Snacks", time, categorizedRecipes, mealsByTime);
          assignRecipesByType(
            "Beverage/Smoothie",
            time,
            categorizedRecipes,
            mealsByTime
          );
          break;

        case "Lunch":
          console.log("Assigning Lunch recipes");
          assignRecipesByType("Meal", time, categorizedRecipes, mealsByTime);
          assignRecipesByType("Grains", time, categorizedRecipes, mealsByTime);
          assignRecipesByType("Dessert", time, categorizedRecipes, mealsByTime);
          break;

        case "Evening":
          console.log("Assigning Evening recipes");
          assignRecipesByType("Snacks", time, categorizedRecipes, mealsByTime);
          assignRecipesByType(
            "Fruit Salad",
            time,
            categorizedRecipes,
            mealsByTime
          );
          assignRecipesByType("Fruit", time, categorizedRecipes, mealsByTime);
          break;

        case "Dinner":
          console.log("Assigning Dinner recipes");
          assignRecipesByType("Meal", time, categorizedRecipes, mealsByTime);
          assignRecipesByType("Grains", time, categorizedRecipes, mealsByTime);
          assignRecipesByType("Dessert", time, categorizedRecipes, mealsByTime);
          break;

        default:
          console.log(`No specific logic for ${time.title}`);
          break;
      }
    });

    // Return recipes for the given date
    return mealsByTime;
  } catch (error) {
    console.error("Error generating recipes for date:", error);
    // Return null or an empty object as appropriate
    return null;
  }
};

// Function to assign recipes of a specific type to a meal time
const assignRecipesByType = (
  type: string,
  mealTime: MealTimes,
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  mealsByTime: { [key: string]: RecipeWithCategory[] }
) => {
  if (categorizedRecipes[type]?.length > 0) {
    // Check if there are recipes of this type available
    const recipesOfType = categorizedRecipes[type];

    // Find the first recipe that hasn't been used yet and is appropriate for the meal time
    const availableRecipe = recipesOfType.find(
      (recipe) =>
        !isRecipeUsed(recipe, mealsByTime) &&
        recipe.recipeMealTime?.some((mt) => mt.mealTimeId === mealTime.id)
    );

    if (availableRecipe) {
      mealsByTime[mealTime.slug].push(availableRecipe);
      console.log(`Assigned ${type} Recipe:`, availableRecipe);
    } else {
      console.log(`No available ${type} recipes to assign.`);
    }
  } else {
    console.log(`No recipes of type ${type} available.`);
  }
};

// Function to check if a recipe is already assigned to a meal time
const isRecipeUsed = (
  recipe: RecipeWithCategory,
  mealsByTime: { [key: string]: RecipeWithCategory[] }
): boolean => {
  const usedRecipes = Object.values(mealsByTime).flatMap((recipes) => recipes);
  return usedRecipes.some((usedRecipe) => usedRecipe.id === recipe.id);
};
