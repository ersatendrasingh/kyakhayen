"use client";

import {
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeSeasons,
  Recipes,
} from "@prisma/client";
import { Preview } from "../preview";
import { AlarmClock } from "lucide-react";
import { FaSignal } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";
import { FaCloudSunRain } from "react-icons/fa";
import { formatTime } from "@/lib/formatTime";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeCookingTime: RecipeCookingTime | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeSeasons: RecipeSeasons | null;
};

interface RecipeOverviewProps {
  recipe: RecipeWithCategory;
  quantity: number;
}

const RecipeOverview = ({ recipe, quantity }: RecipeOverviewProps) => {
  return (
    <div className="w-full items-start justify-start ">
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 border-b-2 border-gray-200 pb-4">
        {recipe.recipeCookingTime?.prepTime && (
          <p className="text-sm text-center">
            <span className="font-bold text-blue-500">Preparation time</span>
            <span className="flex items-center justify-center">
              <AlarmClock className="w-6 h-6 pr-2" />
              {formatTime(recipe.recipeCookingTime.prepTime)}
            </span>
          </p>
        )}

        {recipe.recipeCookingTime?.cookTime && (
          <p className="text-sm text-center">
            <span className="font-bold text-green-500">Cooking time</span>
            <span className="flex items-center justify-center">
              <AlarmClock className="w-6 h-6 pr-2" />
              {formatTime(recipe.recipeCookingTime.cookTime)}
            </span>
          </p>
        )}

        {recipe.recipeCookingTime?.restTime && (
          <p className="text-sm text-center">
            <span className="font-bold text-orange-500">Rest time</span>
            <span className="flex items-center justify-center">
              <AlarmClock className="w-6 h-6 pr-2" />
              {formatTime(recipe.recipeCookingTime.restTime)}
            </span>
          </p>
        )}

        <p className="text-sm text-center">
          <span className="font-bold text-purple-500">Total time</span>
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
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 border-b-2 border-gray-200 pb-5">
        {recipe.recipeDifficultyId && (
          <p className="text-sm text-center">
            <span className="font-bold text-websecondary">
              Difficulty level
            </span>
            <span className="flex items-center justify-center font-bold text-green-500">
              <FaSignal className="w-6 h-6 pr-2 text-green-500" />
              {recipe.recipeDifficulty?.title}
            </span>
          </p>
        )}
        {recipe.recipeSeasonsId && (
          <p className="text-sm text-center">
            <span className="font-bold text-websecondary">Best Season</span>
            <span className="flex items-center justify-center font-bold text-blue-500">
              <FaCloudSunRain className="w-6 h-6 pr-2 text-blue-500" />
              {recipe.recipeSeasons?.title}
            </span>
          </p>
        )}
        {recipe.recipeDifficultyId && (
          <p className="text-sm text-center">
            <span className="font-bold text-websecondary">Serving size</span>
            <span className="flex items-center justify-center font-bold text-purple-500">
              <MdFoodBank className="w-8 h-8 pr-2 text-purple-500" />
              {quantity}{" "}
              <span className="text-purple-500">
                {quantity > 1 ? "People" : "Person"}
              </span>
            </span>
          </p>
        )}
      </div>
      <h1 className="text-2xl font-bold mt-4">Description</h1>
      {recipe.description && <Preview value={recipe.description} />}
    </div>
  );
};

export default RecipeOverview;
