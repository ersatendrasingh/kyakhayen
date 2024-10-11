import {
  Comment,
  CookingMethods,
  Cuisines,
  IngredientUnitMeasurements,
  Ingredients,
  IngredientsForm,
  Nutrient,
  Prakriti,
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeHealthBenefits,
  RecipeIngredients,
  RecipeMethods,
  RecipeSeasons,
  Recipes,
  Review,
  Units,
  recipeHealthGoals,
  recipeMealTime,
} from "@prisma/client";

export type RecipeCookingMethod = {
  id: string;
  cookingMethodId: string;
  recipeId: string;
  cookingMethod: CookingMethods;
};

export type RecipeCuisines = {
  id: string;
  cuisineId: string;
  recipeId: string;
  cuisine: Cuisines;
};

export type RecipePrakriti = {
  id: string;
  recipeId: string;
  prakritiId: string;
  prakriti: Prakriti;
};

export type RecipeDietType = {
  id: string;
  recipeId: string;
  dietTypeId: string;
  dietType: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
  };
};

export type RecipeRecipeType = {
  id: string;
  recipeId: string;
  recipeTypeId: string;
  recipeType: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
  };
};

export type RecipeNutrient = {
  id: string;
  recipeId: string;
  nutrientId: string;
  nutrient: Nutrient;
};

export type RecipeIngredientType = RecipeIngredients & {
  unit?: Units;
  ingredientForm?: IngredientsForm;
  ingredient: Ingredients & {
    IngredientUnitMeasurements: IngredientUnitMeasurements[];
  };
};

export type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeIngredients: RecipeIngredientType[];
  recipeMethods: RecipeMethods[];
  recipeHealthGoals: recipeHealthGoals[];
  recipeHealthBenefits: RecipeHealthBenefits[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeDietType: RecipeDietType[] | null;
  recipeRecipeType: RecipeRecipeType[] | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
  recipeCookingMethods: RecipeCookingMethod[] | null;
  recipeCuisine: RecipeCuisines[] | null;
  recipeNutrient: RecipeNutrient[] | null;
  recipeMealTime: recipeMealTime[] | null;
  recipeComments: Comment[] | null;
  recipePrakriti: RecipePrakriti[] | null;
  Review: Review[] | null;
};
