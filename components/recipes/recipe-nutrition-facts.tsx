"use client";

import RecipeFeatureItem from "./recipe-feature-item";
import { RecipeIngredientType } from "@/types/recipe";
import { calculateRecipeNutrition } from "@/lib/calculate-recipe-nutrition";

interface RecipeNutritionFactsProps {
  recipeIngredients: RecipeIngredientType[];
}

const RecipeNutritionFacts = ({
  recipeIngredients,
}: RecipeNutritionFactsProps) => {
  const hasVerifiedNutrition =
    recipeIngredients.length > 0 &&
    recipeIngredients.every((item) => item.ingredient.isPublished);
  const { totals, missingConversions } = calculateRecipeNutrition(recipeIngredients);

  if (!hasVerifiedNutrition || missingConversions.length > 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Nutrition calculation is under verification for this recipe. Ingredients and
        preparation steps are available now.
      </p>
    );
  }

  return (
    <>
      <div className="w-full items-start justify-start ">
        <div>
          <RecipeFeatureItem
            title="Calories"
            imageUrl="/assets/images/calories-icon.png"
            values={totals.calories.toFixed(2)}
            unit="kcal"
          />

          <RecipeFeatureItem
            title="Carbohydrate"
            imageUrl="/assets/images/carbohydrate-icon.png"
            values={totals.carbohydrate.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Total Fat"
            imageUrl="/assets/images/fat-icon.png"
            values={totals.totalFat.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Dietary Fiber"
            imageUrl="/assets/images/fiber-icon.png"
            values={totals.dietaryFiber.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Protein"
            imageUrl="/assets/images/protein-icon.png"
            values={totals.protein.toFixed(2)}
            unit="g"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-evenly text-justify gap-5 mt-2">
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin A : {totals.vitaminA.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Ascorbic acids (C) : {totals.ascorbicAcids.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin D : {totals.vitaminD.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Tocopherol equivalent (E) : {totals.tocopherolEquivalent.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin K : {totals.vitaminK.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Thiamine (B1) : {totals.thiamine.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Riboflavin (B2) : {totals.riboflavin.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Total B6 : {totals.totalB6.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Folates (B9) : {totals.folates.toFixed(1)} µg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Calcium (Ca) : {totals.calcium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Iron (Fe) : {totals.iron.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Phosphorus (P) : {totals.phosphorus.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Potassium (K) : {totals.potassium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Sodium (Na) : {totals.sodium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Zinc (Zn) : {totals.zinc.toFixed(1)} mg
        </div>
      </div>
    </>
  );
};

export default RecipeNutritionFacts;
