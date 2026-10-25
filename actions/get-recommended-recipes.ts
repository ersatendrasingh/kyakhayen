"use server";

import type { Prisma } from "@prisma/client";
import type { RecipeCardRecipe } from "@/components/recipes/recipe-card";
import { db } from "@/lib/db";
import { getFoodPreferenceCategorySlugs } from "@/lib/recipe-category-compatibility";
import { publishedRecipeWhere } from "@/lib/recipe-publication";

const PAGE_SIZE = 8;

const recommendationInclude = {
  RecipeCategories: { select: { id: true, name: true } },
  recipeCookingTime: true,
  recipeCuisine: {
    select: { cuisine: { select: { title: true } } },
    take: 1,
  },
  recipeNutrient: {
    where: { nutrient: { isPublished: true } },
    select: { nutrient: { select: { title: true } } },
    take: 1,
  },
  Review: { select: { rating: true } },
} satisfies Prisma.RecipesInclude;

export const getRecommendedRecipes = async (
  page: number = 1,
  userId: string,
  isPersonalized: boolean,
  _behaviorData: Record<string, number>,
  _categoryData: Record<string, number>
): Promise<{ recipes: RecipeCardRecipe[]; hasMore: boolean }> => {
  try {
    void _behaviorData;
    void _categoryData;
    const where: Prisma.RecipesWhereInput = {
      ...publishedRecipeWhere(),
      imageUrl: { not: null },
      NOT: { recipeRecipeType: { some: { recipeType: { slug: "desserts" } } } },
    };

    // Keep personalization in the database query. The old implementation
    // loaded the entire catalog and every recipe relation before paginating.
    if (isPersonalized && userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          foodPreferenceId: true,
          UserAllrgies: { select: { allergyId: true } },
          userCuisines: { select: { cuisineId: true } },
        },
      });

      if (user?.foodPreferenceId) {
        const preferenceCategory = await db.recipeCategories.findUnique({
          where: { id: user.foodPreferenceId },
          select: { slug: true },
        });
        const categorySlugs = preferenceCategory
          ? getFoodPreferenceCategorySlugs(preferenceCategory.slug)
          : [];
        const categories = categorySlugs.length
          ? await db.recipeCategories.findMany({
              where: { isPublished: true, slug: { in: categorySlugs } },
              select: { id: true },
            })
          : [];
        const categoryIds = categories.map((category) => category.id);
        if (categoryIds.length > 0) {
          where.recipeCategoriesId = { in: categoryIds };
        }
      }
      if (user && user.UserAllrgies.length > 0) {
        where.recipeAllergies = {
          none: { allergyId: { in: user.UserAllrgies.map((item) => item.allergyId) } },
        };
      }
      if (user && user.userCuisines.length > 0) {
        where.recipeCuisine = {
          some: { cuisineId: { in: user.userCuisines.map((item) => item.cuisineId) } },
        };
      }
    }

    const recipes = await db.recipes.findMany({
      where,
      include: recommendationInclude,
      orderBy: [{ views: "desc" }, { contentUpdatedAt: "desc" }, { id: "desc" }],
      skip: Math.max(0, page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    });

    const hasMore = recipes.length > PAGE_SIZE;
    return { recipes: hasMore ? recipes.slice(0, PAGE_SIZE) : recipes, hasMore };
  } catch (error) {
    console.error("[GET_RECOMMENDED_RECIPES]", error);
    return { recipes: [], hasMore: false };
  }
};
