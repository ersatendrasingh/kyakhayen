import {
  CookingMethods,
  Cuisines,
  IngredientUnitMeasurements,
  Ingredients,
  IngredientsForm,
  Nutrient,
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeHealthBenefits,
  RecipeIngredients,
  RecipeMethods,
  RecipeSeasons,
  Recipes,
  Units,
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
  recipeHealthBenefits: RecipeHealthBenefits[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeDietType: RecipeDietType[] | null;
  recipeRecipeType: RecipeRecipeType[] | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
  recipeCookingMethods: RecipeCookingMethod[] | null;
  recipeCuisine: RecipeCuisines[] | null;
  recipeNutrient: RecipeNutrient[] | null;
};
