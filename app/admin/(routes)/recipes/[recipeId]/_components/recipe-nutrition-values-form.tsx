"use client";

import { RecipeIngredientType } from "@/types/recipe";
import { calculateRecipeNutrition } from "@/lib/calculate-recipe-nutrition";

interface RecipeNutritionValuesFormProps {
  initialData: RecipeIngredientType[];
}

export const RecipeNutritionValuesForm = ({
  initialData,
}: RecipeNutritionValuesFormProps) => {
  const { totals, missingConversions } = calculateRecipeNutrition(initialData);

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe Macros Values
      </div>

      <div className="flex flex-wrap items-center justifxy-between gap-2 mt-2">
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Calories: {totals.calories.toFixed(2)} kcal
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Carbohydrate: {totals.carbohydrate.toFixed(2)} g
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Total Fat: {totals.totalFat.toFixed(2)} g
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Dietary Fiber: {totals.dietaryFiber.toFixed(2)} g
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Protein: {totals.protein.toFixed(2)} g
        </div>
      </div>
      <div className="flex items-center justify-between font-medium mt-6">
        Recipe Micros Values
      </div>

      <div className="flex flex-wrap items-center justifxy-between gap-2 mt-2">
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
      {missingConversions.length > 0 && (
        <p className="mt-4 text-sm text-amber-700">
          Nutrition totals exclude ingredients without a gram conversion:{" "}
          {missingConversions.join(", ")}.
        </p>
      )}
    </div>
  );
};
