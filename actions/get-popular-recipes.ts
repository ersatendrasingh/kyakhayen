"use server";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getRecipeCategoryWhereForBrowse } from "@/lib/recipe-category-compatibility";
import { publishedRecipeWhere } from "@/lib/recipe-publication";
import type { RecipeCardRecipe } from "@/components/recipes/recipe-card";

type GetRecipes = {
  title?: string;
  searchSlug?: string;
  searchType?: "category" | "mealTime";
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE = 8; // Default page size

export const getPopularRecipes = async ({
  title,
  searchSlug,
  searchType,
  page = 1,
  pageSize = PAGE_SIZE,
}: GetRecipes): Promise<{
  recipes: RecipeCardRecipe[];
  hasMore: boolean;
}> => {
  try {
    const whereClause: Prisma.RecipesWhereInput = publishedRecipeWhere();

    if (title) {
      whereClause.title = {
        contains: title,
      };
    }

    if (searchType && searchSlug) {
      if (searchType === "category") {
        const categoryWhere = await getRecipeCategoryWhereForBrowse(searchSlug);

        if (!categoryWhere) {
          return { recipes: [], hasMore: false };
        }

        Object.assign(whereClause, categoryWhere);
      } else if (searchType === "mealTime") {
        const mealTime = await db.mealTimes.findFirst({
          where: { slug: searchSlug, isPublished: true },
        });

        if (!mealTime) {
          return { recipes: [], hasMore: false };
        }

        whereClause.recipeMealTime = {
          some: { mealTimeId: mealTime.id },
        };
      }
    }

    // Fetch one extra card to determine whether another page exists. A count
    // query on every client pagination request was needlessly expensive.
    const recipes = await db.recipes.findMany({
      where: whereClause,
      include: {
        RecipeCategories: {
          select: {
            id: true,
            name: true,
          },
        },
        recipeCuisine: {
          select: { cuisine: { select: { title: true } } },
          take: 1,
        },
        recipeNutrient: {
          where: {
            nutrient: { isPublished: true },
          },
          select: { nutrient: { select: { title: true } } },
          take: 1,
        },
        recipeCookingTime: true,
        Review: { select: { rating: true } },
      },
      orderBy: [{ views: "desc" }, { contentUpdatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });

    const hasMore = recipes.length > pageSize;

    return { recipes: hasMore ? recipes.slice(0, pageSize) : recipes, hasMore };
  } catch (error) {
    console.error("[GET_RECIPES_ERROR]", error);
    return { recipes: [], hasMore: false };
  }
};
