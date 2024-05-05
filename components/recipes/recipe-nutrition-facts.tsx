"use client";

import {
  CookingMethods,
  Cuisines,
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeMethods as RecipeMethodType,
  RecipeNutritionValues,
  RecipeSeasons,
  Recipes,
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

interface RecipeNutritionFactsProps {
  recipeNutritionFacts: RecipeNutritionValues | null;
}

const RecipeNutritionFacts = ({
  recipeNutritionFacts,
}: RecipeNutritionFactsProps) => {
  return (
    <div className="w-full items-start justify-start ">
      <div>
        {recipeNutritionFacts && recipeNutritionFacts.calories && (
          <RecipeFeatureItem
            title="Calories"
            imageUrl="/assets/images/calories-icon.png"
            values={recipeNutritionFacts?.calories}
            unit="kcal"
          />
        )}
        {recipeNutritionFacts && recipeNutritionFacts.carbohydrate && (
          <RecipeFeatureItem
            title="Carbohydrate"
            imageUrl="/assets/images/carbohydrate-icon.png"
            values={recipeNutritionFacts?.carbohydrate}
            unit="g"
          />
        )}
        {recipeNutritionFacts && recipeNutritionFacts.totalFat && (
          <RecipeFeatureItem
            title="Total Fat"
            imageUrl="/assets/images/fat-icon.png"
            values={recipeNutritionFacts?.totalFat}
            unit="g"
          />
        )}
        {recipeNutritionFacts && recipeNutritionFacts.dietaryFiber && (
          <RecipeFeatureItem
            title="Dietary Fiber"
            imageUrl="/assets/images/fiber-icon.png"
            values={recipeNutritionFacts?.dietaryFiber}
            unit="g"
          />
        )}
        {recipeNutritionFacts && recipeNutritionFacts.protein && (
          <RecipeFeatureItem
            title="Protein"
            imageUrl="/assets/images/protein-icon.png"
            values={recipeNutritionFacts?.protein}
            unit="g"
          />
        )}
      </div>
    </div>
  );
};

export default RecipeNutritionFacts;
