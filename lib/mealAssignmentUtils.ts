import { MealTimes } from "@prisma/client";
import { RecipeWithCategory } from "@/types/recipe";

// Function to assign recipes of a specific type to a meal time
export const assignRecipesByType = (
  type: string,
  mealTime: MealTimes,
  categorizedRecipes: { [key: string]: RecipeWithCategory[] },
  mealsByTime: { [key: string]: RecipeWithCategory[] }
) => {
  if (categorizedRecipes[type]?.length > 0) {
    const recipes = categorizedRecipes[type].splice(0, mealTime.numRecipes);

    mealsByTime[mealTime.slug].push(...recipes);
  }
};

// Function to generate recipes for a given date based on user preferences
export const generateRecipesForDate = async (
  userId: string,
  date: Date,
  db: any // Adjust 'any' to your actual database client type
): Promise<{ [key: string]: RecipeWithCategory[] } | null> => {
  try {
    // Fetch user details including preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userCuisines: true,
        UserAllergies: true,
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

    // Your existing logic for filtering recipes and processing them

    // Example of returning mealsByTime from the function
    return mealsByTime;
  } catch (error) {
    console.error("Error generating recipes for date:", error);
    return null;
  }
};
