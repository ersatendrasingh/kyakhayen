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
      },
    });

    if (!userData) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const currentMonth = new Date().getMonth() + 1;

    // Fetch all recipes
    const allRecipes = await GetRecipes({});

    // Fetch all recipe categories and create a category map
    const recipeCategories = await db.recipeCategories.findMany({
      where: { isPublished: true },
    });
    const categoryMap = recipeCategories.reduce((map, category) => {
      map[category.slug] = category.id;
      if (category.slug === "egg") {
        map.eggetarian = category.id;
      }
      return map;
    }, {} as { [key: string]: string });

    // Extract user preference IDs from related tables
    const userAllergyIds = userData.UserAllrgies.map(
      (allergy) => allergy.allergyId
    );
    const userCuisineIds = userData.userCuisines.map(
      (cuisine) => cuisine.cuisineId
    );
    // Fetch recipe-related data
    const recipeAllergies = await db.recipeAllergies.findMany();
    const recipeCuisines = await db.recipeCuisines.findMany();

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

    // Filter recipes based on user preferences
    const filteredRecipes = allRecipes.filter((recipe) => {
      // Check if recipe matches user's food preferences

      const matchesFoodPreference = (() => {
        switch (userData.foodPreferenceId) {
          case categoryMap["non veg"]:
            return true; // Non-veg users can eat all types of food
          case categoryMap["veg"]:
            return recipe.recipeCategoriesId === categoryMap["veg"];
          case categoryMap["eggetarian"]:
            return (
              recipe.recipeCategoriesId === categoryMap["veg"] ||
              recipe.recipeCategoriesId === categoryMap["eggetarian"]
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

      // Check if recipe matches user's cooking skill level   - This will be removed in the future
      // const matchesCookingSkill =
      //   !userData.cookingSkillId ||
      //   recipe.recipeDifficultyId! <= userData.cookingSkillId;

      // return (
      //   matchesFoodPreference &&
      //   !containsAllergens &&
      //   matchesCuisinePreference //&&
      //   //matchesCookingSkill
      // );

      const matchesAnyPreference =
        matchesFoodPreference &&
        !containsAllergens &&
        (userCuisineIds.length === 0 || matchesCuisinePreference);

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
