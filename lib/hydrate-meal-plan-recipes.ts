import { db } from "@/lib/db";
import type { RecipeWithCategory } from "@/types/recipe";

type MealsByTime = Record<string, RecipeWithCategory[]>;

/**
 * Saved meal plans preserve selection history, while current recipe identity
 * remains authoritative in the database after editorial or SEO updates.
 */
export async function hydrateMealPlanRecipes(
  mealsByTime: MealsByTime,
): Promise<MealsByTime> {
  const recipeIds = Array.from(
    new Set(Object.values(mealsByTime).flatMap((recipes) => recipes.map((recipe) => recipe.id))),
  );

  if (recipeIds.length === 0) return mealsByTime;

  const currentRecipes = await db.recipes.findMany({
    where: {
      id: { in: recipeIds },
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      metaSlug: true,
      imageUrl: true,
    },
  });
  const currentById = new Map(currentRecipes.map((recipe) => [recipe.id, recipe]));

  return Object.fromEntries(
    Object.entries(mealsByTime).map(([mealTime, recipes]) => [
      mealTime,
      recipes.flatMap((recipe) => {
        const current = currentById.get(recipe.id);
        return current ? [{ ...recipe, ...current } as RecipeWithCategory] : [];
      }),
    ]),
  );
}
