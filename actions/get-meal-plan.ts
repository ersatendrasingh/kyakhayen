"use server";
import { db } from "@/lib/db";
import { RecipeWithCategory } from "@/types/recipe";
import { MealTimes } from "@prisma/client";

type GetMealPlanParams = {
  date: Date;
};

type MealPlanResult = {
  mealTimes: MealTimes[];
  mealsByTime: { [key: string]: RecipeWithCategory[] };
};

export const getMealPlan = async ({
  date,
}: GetMealPlanParams): Promise<MealPlanResult | null> => {
  try {
    // Get all meal times
    const mealTimes = await db.mealTimes.findMany();

    // Sort meal times according to the specified order
    const order = ["Breakfast", "Mid Morning", "Lunch", "Evening", "Dinner"];
    mealTimes.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));

    // Get all published recipes with their types
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
        recipeCookingTime: true,
        recipeDifficulty: true,
        recipeSeasons: true,
      },
    });

    // Categorize recipes based on their types dynamically
    const categorizedRecipes: { [key: string]: RecipeWithCategory[] } = {};
    allRecipes.forEach((recipe) => {
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

    // Create a map to store assigned recipes for each meal time by date
    const mealsByTime: { [key: string]: RecipeWithCategory[] } = {};
    const usedRecipes = new Set<string>();

    mealTimes.forEach((time) => {
      mealsByTime[time.slug] = [];

      if (time.title === "Breakfast") {
        // For breakfast, main dish + optional beverage or chutney
        const mainDish = categorizedRecipes["Meal"]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (mainDish) {
          mealsByTime[time.slug].push(mainDish);
          usedRecipes.add(mainDish.id);
        }

        const options = ["Beverage", "Chutney/Dips"];
        options.forEach((option) => {
          const recipe = categorizedRecipes[option]?.find(
            (recipe) => !usedRecipes.has(recipe.id)
          );
          if (recipe) {
            mealsByTime[time.slug].push(recipe);
            usedRecipes.add(recipe.id);
          }
        });
      } else if (time.title === "Mid Morning") {
        // For midmorning, only fruit salads
        const fruitSalad = categorizedRecipes["Fruit Salad"]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (fruitSalad) {
          mealsByTime[time.slug].push(fruitSalad);
          usedRecipes.add(fruitSalad.id);
        }
      } else if (time.title === "Lunch" || time.title === "Dinner") {
        // For lunch and dinner, main dish + staple (roti or rice) + optional vegetable salad
        const mainDish = categorizedRecipes["Meal"]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (mainDish) {
          mealsByTime[time.slug].push(mainDish);
          usedRecipes.add(mainDish.id);
        }

        const staple = categorizedRecipes["Grains"]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (staple) {
          mealsByTime[time.slug].push(staple);
          usedRecipes.add(staple.id);
        }

        const vegetableSalad = categorizedRecipes["Vegetable Salad"]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (vegetableSalad) {
          mealsByTime[time.slug].push(vegetableSalad);
          usedRecipes.add(vegetableSalad.id);
        }
      } else if (time.title === "Evening") {
        // For evening, only soup or fruit salad, but not both
        const options = ["Soup", "Fruit Salad"];
        const selectedOption =
          options[Math.floor(Math.random() * options.length)];
        const recipe = categorizedRecipes[selectedOption]?.find(
          (recipe) => !usedRecipes.has(recipe.id)
        );
        if (recipe) {
          mealsByTime[time.slug].push(recipe);
          usedRecipes.add(recipe.id);
        }
      }
    });

    return { mealTimes, mealsByTime };
  } catch (error) {
    console.error("[GET_MEAL_PLAN]", error);
    return null;
  }
};
