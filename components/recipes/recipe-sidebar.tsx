"use client";

import { MealTimes, RecipeCategories, RecipeSeasons } from "@prisma/client";

import RecipeSidebarWidget from "./recipe-sidebar-widget";

interface RecipeSidebarProps {
  recipeCategories: RecipeCategories[];
  recipeMealTimes?: MealTimes[];
}

const RecipeSidebar = ({
  recipeCategories,
  recipeMealTimes,
}: RecipeSidebarProps) => {
  return (
    <div className="w-full py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2">
      <RecipeSidebarWidget
        title="Recipe by food preference"
        widgetItems={recipeCategories}
        type="category"
      />
      <RecipeSidebarWidget
        title="Recipe by meal time"
        widgetItems={recipeMealTimes}
        type="mealTime"
      />
    </div>
  );
};

export default RecipeSidebar;
