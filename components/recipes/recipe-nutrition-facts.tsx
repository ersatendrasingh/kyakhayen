"use client";

import RecipeFeatureItem from "./recipe-feature-item";
import { RecipeIngredientType } from "@/types/recipe";

interface RecipeNutritionFactsProps {
  recipeIngredients: RecipeIngredientType[];
}

const RecipeNutritionFacts = ({
  recipeIngredients,
}: RecipeNutritionFactsProps) => {
  let totalCalories = 0;
  let totalCarbohydrate = 0;
  let totalProtein = 0;
  let totalFiber = 0;
  let totalFat = 0;
  let totalVitaminA = 0;
  let totalVitaminD = 0;
  let totalVitaminK = 0;
  let totalAscorbicAcids = 0;
  let totalTocopherolEquivalent = 0;
  let totalThiamine = 0;
  let totalRiboflavin = 0;
  let totalTotalB6 = 0;
  let totalFolates = 0;
  let totalCalcium = 0;
  let totalIron = 0;
  let totalPhophorus = 0;
  let totalPotassium = 0;
  let totalSodium = 0;
  let totalZinc = 0;

  recipeIngredients.forEach((ingredient) => {
    const unitMeasurements = ingredient.ingredient.IngredientUnitMeasurements;
    const matchingUnit = unitMeasurements.find(
      (measurement) => measurement.unitId === ingredient.unitId
    );
    let adjustedQuantity = ingredient.quantity;
    if (matchingUnit) {
      adjustedQuantity = matchingUnit
        ? matchingUnit?.values * ingredient.quantity
        : ingredient.quantity;
    } else {
      adjustedQuantity = ingredient.quantity;
    }

    const adjustedCalories =
      ((ingredient.ingredient?.calories || 0) / 100) * adjustedQuantity;
    const adjustedCarbohydrate =
      ((ingredient.ingredient?.carbohydrate || 0) / 100) * adjustedQuantity;
    const adjustedProtein =
      ((ingredient.ingredient?.protein || 0) / 100) * adjustedQuantity;
    const adjustedFiber =
      ((ingredient.ingredient?.dietaryFiber || 0) / 100) * adjustedQuantity;
    const adjustedFat =
      ((ingredient.ingredient?.totalFat || 0) / 100) * adjustedQuantity;
    const adjustedVitaminA =
      ((ingredient.ingredient?.vitaminA || 0) / 100) * adjustedQuantity;
    const adjustedVitaminD =
      ((ingredient.ingredient?.vitaminD || 0) / 100) * adjustedQuantity;
    const adjustedVitaminK =
      ((ingredient.ingredient?.vitaminK || 0) / 100) * adjustedQuantity;
    const adjustedAscorbicAcids =
      ((ingredient.ingredient?.ascorbicAcids || 0) / 100) * adjustedQuantity;
    const adjustedTocopherolEquivalent =
      ((ingredient.ingredient?.tocopherolEquivalent || 0) / 100) *
      adjustedQuantity;
    const adjustedThiamine =
      ((ingredient.ingredient?.thiamine || 0) / 100) * adjustedQuantity;
    const adjustedRiboflavin =
      ((ingredient.ingredient?.riboflavin || 0) / 100) * adjustedQuantity;
    const adjustedTotalB6 =
      ((ingredient.ingredient?.totalB6 || 0) / 100) * adjustedQuantity;
    const adjustedFolates =
      ((ingredient.ingredient?.folates || 0) / 100) * adjustedQuantity;
    const adjustedCalcium =
      ((ingredient.ingredient?.calcium || 0) / 100) * adjustedQuantity;
    const adjustedIron =
      ((ingredient.ingredient?.iron || 0) / 100) * adjustedQuantity;
    const adjustedPhophorus =
      ((ingredient.ingredient?.phophorus || 0) / 100) * adjustedQuantity;
    const adjustedPotassium =
      ((ingredient.ingredient?.potassium || 0) / 100) * adjustedQuantity;
    const adjustedSodium =
      ((ingredient.ingredient?.sodium || 0) / 100) * adjustedQuantity;
    const adjustedZinc =
      ((ingredient.ingredient?.zinc || 0) / 100) * adjustedQuantity;
    // Add adjusted nutrition values to total
    totalCalories += adjustedCalories;
    totalCarbohydrate += adjustedCarbohydrate;
    totalProtein += adjustedProtein;
    totalFiber += adjustedFiber;
    totalFat += adjustedFat;
    totalVitaminA += adjustedVitaminA;
    totalVitaminD += adjustedVitaminD;
    totalVitaminK += adjustedVitaminK;
    totalAscorbicAcids += adjustedAscorbicAcids;
    totalTocopherolEquivalent += adjustedTocopherolEquivalent;
    totalThiamine += adjustedThiamine;
    totalRiboflavin += adjustedRiboflavin;
    totalTotalB6 += adjustedTotalB6;
    totalFolates += adjustedFolates;
    totalCalcium += adjustedCalcium;
    totalIron += adjustedIron;
    totalPhophorus += adjustedPhophorus;
    totalPotassium += adjustedPotassium;
    totalSodium += adjustedSodium;
    totalZinc += adjustedZinc;
  });

  return (
    <>
      <div className="w-full items-start justify-start ">
        <div>
          <RecipeFeatureItem
            title="Calories"
            imageUrl="/assets/images/calories-icon.png"
            values={totalCalories.toFixed(2)}
            unit="kcal"
          />

          <RecipeFeatureItem
            title="Carbohydrate"
            imageUrl="/assets/images/carbohydrate-icon.png"
            values={totalCarbohydrate.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Total Fat"
            imageUrl="/assets/images/fat-icon.png"
            values={totalFat.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Dietary Fiber"
            imageUrl="/assets/images/fiber-icon.png"
            values={totalFiber.toFixed(2)}
            unit="g"
          />

          <RecipeFeatureItem
            title="Protein"
            imageUrl="/assets/images/protein-icon.png"
            values={totalProtein.toFixed(2)}
            unit="g"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-evenly text-justify gap-5 mt-2">
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin A : {totalVitaminA.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Ascorbic acids (C) : {totalAscorbicAcids.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin D : {totalVitaminD.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Tocopherol equivalent (E) : {totalTocopherolEquivalent.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Vitamin K : {totalCalories.toFixed(1)} μg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Thiamine (B1) : {totalThiamine.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Riboflavin (B2) : {totalRiboflavin.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Total B6 : {totalTotalB6.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Folates (B9) : {totalFolates.toFixed(1)} µg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Calcium (Ca) : {totalCalcium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Iron (Fe) : {totalIron.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Phophorus (P) : {totalPhophorus.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Potassium (K) : {totalPotassium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Sodium (Na) : {totalSodium.toFixed(1)} mg
        </div>
        <div className="text-sm bg-green-500/20 border-green-500 border p-2 rounded-md">
          Zinc (Zn) : {totalZinc.toFixed(1)} mg
        </div>
      </div>
    </>
  );
};

export default RecipeNutritionFacts;
