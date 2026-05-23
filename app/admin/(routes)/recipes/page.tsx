import { db } from "@/lib/db";
import RecipesTable from "./_components/recipes-table";
import { getRecipes } from "@/actions/get-all-recipes";

const RecipesPage = async () => {
  const recipes = await getRecipes();
  const recipeCategories = await db.recipeCategories.findMany({
    orderBy: {
      position: "asc",
    },
  });
  const cuisines = await db.cuisines.findMany({
    where: {
      recipeCuisine: {
        some: {},
      },
    },
    orderBy: {
      position: "asc",
    },
  });
  const mealTimes = await db.mealTimes.findMany({
    where: {
      recipeMealTime: {
        some: {},
      },
    },
    orderBy: {
      position: "asc",
    },
  });
  return (
    <div className="p-6">
      <RecipesTable
        initialRecipes={recipes}
        categories={recipeCategories}
        cuisines={cuisines}
        mealTimes={mealTimes}
      />
    </div>
  );
};

export default RecipesPage;
