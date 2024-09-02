"use server";
import { RecipeWithCategory } from "@/types/recipe";
import { GetRecipes } from "@/actions/get-recipes";
import { db } from "@/lib/db";
import { filterRecipesBySeason } from "./filterBySeason";

export const filterRecipesByUserPreferences = async (
  userId: string
): Promise<RecipeWithCategory[]> => {
  try {
    // Fetch user data with necessary relations
    const userData = await db.user.findUnique({
      where: { id: userId },
      include: {
        userCuisines: true,
        UserAllrgies: true,
        UserHealthGoals: true,
      },
    });

    if (!userData) {
      throw new Error(`User with ID ${userId} not found.`);
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

    // Extract user preference IDs from related tables
    const userAllergyIds = userData.UserAllrgies.map(
      (allergy) => allergy.allergyId
    );
    const userCuisineIds = userData.userCuisines.map(
      (cuisine) => cuisine.cuisineId
    );
    const userHealthGoalIds = userData.UserHealthGoals.map(
      (goal) => goal.healthGoalId
    );

    // Fetch recipe-related data
    const recipeAllergies = await db.recipeAllergies.findMany();
    const recipeCuisines = await db.recipeCuisines.findMany();
    const recipeHealthGoals = await db.recipeHealthGoals.findMany();
    const recipePrakritis = await db.recipePrakriti.findMany();

    // Create maps for filtering
    const recipeAllergyMap = recipeAllergies.reduce((map, allergy) => {
      if (!map[allergy.recipeId]) {
        map[allergy.recipeId] = [];
      }
      map[allergy.recipeId].push(allergy.allergyId);
      return map;
    }, {} as { [key: string]: string[] });

    const recipeCuisineMap = recipeCuisines.reduce((map, cuisine) => {
      if (!map[cuisine.recipeId]) {
        map[cuisine.recipeId] = [];
      }
      map[cuisine.recipeId].push(cuisine.cuisineId);
      return map;
    }, {} as { [key: string]: string[] });

    const recipeHealthGoalMap = recipeHealthGoals.reduce((map, goal) => {
      if (!map[goal.recipeId]) {
        map[goal.recipeId] = [];
      }
      map[goal.recipeId].push(goal.healthGoalId);
      return map;
    }, {} as { [key: string]: string[] });

    const recipePrakritiMap = recipePrakritis.reduce((map, prakriti) => {
      if (!map[prakriti.recipeId]) {
        map[prakriti.recipeId] = [];
      }
      map[prakriti.recipeId].push(prakriti.prakritiId);
      return map;
    }, {} as { [key: string]: string[] });

    // Filter recipes based on user preferences
    const filteredRecipes = allRecipes.filter((recipe) => {
      // Check if recipe matches user's food preferences

      const matchesFoodPreference = (() => {
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
      })();

      // Check if recipe contains any allergens
      const containsAllergens = recipeAllergyMap[recipe.id]?.some((allergyId) =>
        userAllergyIds.includes(allergyId)
      );

      // Check if recipe matches user's preferred cuisines
      const matchesCuisinePreference = recipeCuisineMap[recipe.id]?.some(
        (cuisineId) => userCuisineIds.includes(cuisineId)
      );

      // Check if recipe matches user's health goals
      const matchesHealthGoals = recipeHealthGoalMap[recipe.id]?.some(
        (goalId) => userHealthGoalIds.includes(goalId)
      );

      // Check if recipe matches user's prakriti
      const matchesPrakriti = recipePrakritiMap[recipe.id]?.some(
        (prakritiId) => prakritiId === userData.prakritiId
      );

      // Check if recipe matches user's cooking skill level   - This will be removed in the future
      // const matchesCookingSkill =
      //   !userData.cookingSkillId ||
      //   recipe.recipeDifficultyId! <= userData.cookingSkillId;

      // return (
      //   matchesFoodPreference &&
      //   !containsAllergens &&
      //   matchesCuisinePreference &&
      //   matchesHealthGoals &&
      //   matchesPrakriti //&&
      //   //matchesCookingSkill
      // );

      const matchesAnyPreference =
        matchesFoodPreference &&
        !containsAllergens &&
        (matchesCuisinePreference || matchesHealthGoals || matchesPrakriti);

      return matchesAnyPreference;
    });

    // Filter recipes by season
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
