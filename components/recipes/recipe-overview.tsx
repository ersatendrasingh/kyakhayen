"use client";

import {
  CookingMethods,
  Cuisines,
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeMethods as RecipeMethodType,
  RecipeSeasons,
  Recipes,
  RecipeIngredients as RecipeIngredientsType,
  IngredientsForm as IngredientsFormType,
  Ingredients,
  Units,
} from "@prisma/client";
import { Preview } from "../preview";
import { AlarmClock } from "lucide-react";
import { FaSignal } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";
import { FaCloudSunRain } from "react-icons/fa";
import { formatTime } from "@/lib/formatTime";
import { GiCampCookingPot } from "react-icons/gi";
import { PiBowlFoodFill } from "react-icons/pi";
import RecipeFeatureItems from "./recipe-feature-items";
import RecipeFeatureItem from "./recipe-feature-item";

type RecipeIngredientType = RecipeIngredientsType & {
  unit?: Units;
  ingredientForm?: IngredientsFormType;
  ingredient?: Ingredients;
};
type RecipeCookingMethod = {
  id: string;
  cookingMethodId: string;
  recipeId: string;
  cookingMethod: CookingMethods;
};
type RecipeCuisines = {
  id: string;
  cuisineId: string;
  recipeId: string;
  cuisine: Cuisines;
};
type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeIngredients: RecipeIngredientType[];
  recipeMethods: RecipeMethodType[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
  recipeCookingMethods: RecipeCookingMethod[] | null;
  recipeCuisine: RecipeCuisines[] | null;
};

interface RecipeOverviewProps {
  recipe: RecipeWithCategory;
  quantity: number;
}

const RecipeOverview = ({ recipe, quantity }: RecipeOverviewProps) => {
  return (
    <div className="w-full items-start justify-start ">
      {recipe.recipeCookingTime && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 border-b-2 border-gray-200 pb-4">
          {recipe.recipeCookingTime?.prepTime && (
            <p className="text-sm text-center">
              <span className="font-bold">Preparation time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(recipe.recipeCookingTime.prepTime)}
              </span>
            </p>
          )}

          {recipe.recipeCookingTime?.cookTime && (
            <p className="text-sm text-center">
              <span className="font-bold ">Cooking time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(recipe.recipeCookingTime.cookTime)}
              </span>
            </p>
          )}

          {recipe.recipeCookingTime?.restTime && (
            <p className="text-sm text-center">
              <span className="font-bold ">Rest time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(recipe.recipeCookingTime.restTime)}
              </span>
            </p>
          )}
          {recipe.recipeCookingTime && (
            <p className="text-sm text-center">
              <span className="font-bold ">Total time</span>
              <span className="flex items-center justify-center ">
                <AlarmClock className="w-6 h-6 pr-2" />
                {recipe.recipeCookingTime &&
                  formatTime(
                    recipe.recipeCookingTime.prepTime +
                      recipe.recipeCookingTime.cookTime +
                      recipe.recipeCookingTime.restTime
                  )}
              </span>
            </p>
          )}
        </div>
      )}

      <div>
        <RecipeFeatureItem
          title="Serving size"
          icon={<MdFoodBank className="w-6 h-6 pr-2" />}
          values={quantity + " " + (quantity > 1 ? "People" : "Person")}
        />
        {recipe.recipeDifficulty && (
          <RecipeFeatureItem
            title="Difficulty level"
            icon={<FaSignal className="w-6 h-6 pr-2" />}
            values={recipe.recipeDifficulty?.title}
          />
        )}
        {recipe.recipeSeasons && (
          <RecipeFeatureItem
            title="Best Season"
            icon={<FaCloudSunRain className="w-6 h-6 pr-2" />}
            values={recipe.recipeSeasons?.title}
          />
        )}

        {recipe.recipeCookingMethods &&
          recipe.recipeCookingMethods?.length > 0 && (
            <RecipeFeatureItems
              title="Cooking method"
              icon={<GiCampCookingPot className="w-6 h-6 pr-2" />}
              values={recipe.recipeCookingMethods.map(
                (method) => method.cookingMethod.title
              )}
            />
          )}
        {recipe.recipeCuisine && recipe.recipeCuisine?.length > 0 && (
          <RecipeFeatureItems
            title="Cuisines"
            icon={<PiBowlFoodFill className="w-6 h-6 pr-2" />}
            values={recipe.recipeCuisine.map((method) => method.cuisine.title)}
          />
        )}
      </div>

      {recipe.description && (
        <>
          <h1 className="text-2xl font-bold mt-4">Description</h1>
          <Preview value={recipe.description} />
        </>
      )}
    </div>
  );
};

export default RecipeOverview;
