import { unstable_cache } from "next/cache";
import type { Prisma, RecipeCategories, MealTimes, RecipeTypes } from "@prisma/client";

import { db } from "@/lib/db";
import { publishedRecipeAnd } from "@/lib/recipe-publication";
import type { PostWithCategory } from "@/types/article";
import type { RecipeWithCategory } from "@/types/recipe";

const PUBLIC_CONTENT_REVALIDATE_SECONDS = 15 * 60;

const publicRecipeInclude = {
  RecipeCategories: true,
  recipeIngredients: {
    include: {
      unit: true,
      ingredientForm: true,
      ingredient: {
        include: {
          IngredientUnitMeasurements: true,
        },
      },
    },
    orderBy: { position: "asc" },
  },
  recipeMethods: {
    where: { isPublished: true },
    orderBy: { position: "asc" },
  },
  recipeRecipeType: {
    where: { recipeType: { isPublished: true } },
    include: { recipeType: true },
  },
  recipeDietType: {
    where: { dietType: { isPublished: true } },
    include: { dietType: true },
  },
  recipeNutrient: {
    where: { nutrient: { isPublished: true } },
    include: { nutrient: true },
  },
  recipeCookingMethods: {
    include: { cookingMethod: true },
  },
  recipeCuisine: {
    include: { cuisine: true },
  },
  recipeCookingTime: true,
  recipeMealTime: true,
  recipeDifficulty: true,
  recipeSeasons: true,
  recipeSeasonTags: {
    include: { season: true },
  },
  recipeComments: {
    where: { isPublished: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  },
  Review: {
    where: { isPublished: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  },
} satisfies Prisma.RecipesInclude;

const publicRecipeMetadataInclude = {
  RecipeCategories: true,
  recipeCuisine: {
    include: { cuisine: true },
  },
  recipeDietType: {
    where: { dietType: { isPublished: true } },
    include: { dietType: true },
  },
  recipeRecipeType: {
    where: { recipeType: { isPublished: true } },
    include: { recipeType: true },
  },
} satisfies Prisma.RecipesInclude;

const publicArticleInclude = {
  PostCategory: {
    include: { category: true },
  },
  PostTag: {
    include: { tag: true },
  },
  articleComments: {
    where: { isPublished: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  },
} satisfies Prisma.PostInclude;

const publicArticleMetadataInclude = {
  PostCategory: {
    include: { category: true },
  },
  PostTag: {
    include: { tag: true },
  },
} satisfies Prisma.PostInclude;

function routeSlugCandidates(routeSlug: string) {
  const parts = routeSlug.split("-").filter(Boolean);
  const candidates = [{ slug: routeSlug, metaSlug: null as string | null }];

  for (let index = 1; index < parts.length; index += 1) {
    candidates.push({
      slug: parts.slice(0, index).join("-"),
      metaSlug: parts.slice(index).join("-"),
    });
  }

  return candidates;
}

function normalizeRecipe(recipe: Prisma.RecipesGetPayload<{ include: typeof publicRecipeInclude }>): RecipeWithCategory {
  return {
    ...recipe,
    recipeIngredients: recipe.recipeIngredients.map((ingredient) => ({
      ...ingredient,
      quantity: Number(ingredient.quantity),
    })),
  };
}

async function findRecipeByRouteSlug(routeSlug: string) {
  const exactRecipe = await db.recipes.findFirst({
    where: publishedRecipeAnd([{ slug: routeSlug }]),
    include: publicRecipeInclude,
  });

  if (exactRecipe) return normalizeRecipe(exactRecipe);

  const combinedSlugCandidates = routeSlugCandidates(routeSlug)
    .filter((candidate) => candidate.metaSlug)
    .map((candidate) => ({
      slug: candidate.slug,
      metaSlug: candidate.metaSlug as string,
    }));

  if (combinedSlugCandidates.length === 0) return null;

  const recipes = await db.recipes.findMany({
    where: publishedRecipeAnd([
      { slug: { in: combinedSlugCandidates.map((candidate) => candidate.slug) } },
    ]),
    include: publicRecipeInclude,
  });
  const recipe = combinedSlugCandidates
    .map((candidate) =>
      recipes.find(
        (item) => item.slug === candidate.slug && item.metaSlug === candidate.metaSlug,
      ),
    )
    .find((item): item is NonNullable<typeof item> => Boolean(item));

  return recipe ? normalizeRecipe(recipe) : null;
}

async function findRecipeMetadataByRouteSlug(routeSlug: string) {
  const exactRecipe = await db.recipes.findFirst({
    where: publishedRecipeAnd([{ slug: routeSlug }]),
    include: publicRecipeMetadataInclude,
  });

  if (exactRecipe) return exactRecipe;

  const combinedSlugCandidates = routeSlugCandidates(routeSlug)
    .filter((candidate) => candidate.metaSlug)
    .map((candidate) => ({
      slug: candidate.slug,
      metaSlug: candidate.metaSlug as string,
    }));

  if (combinedSlugCandidates.length === 0) return null;

  const recipes = await db.recipes.findMany({
    where: publishedRecipeAnd([
      { slug: { in: combinedSlugCandidates.map((candidate) => candidate.slug) } },
    ]),
    include: publicRecipeMetadataInclude,
  });

  return combinedSlugCandidates
    .map((candidate) =>
      recipes.find(
        (item) => item.slug === candidate.slug && item.metaSlug === candidate.metaSlug,
      ),
    )
    .find((item): item is NonNullable<typeof item> => Boolean(item)) ?? null;
}

async function findArticleByRouteSlug(routeSlug: string): Promise<PostWithCategory | null> {
  const exactArticle = await db.post.findFirst({
    where: { isPublished: true, slug: routeSlug },
    include: publicArticleInclude,
  });

  if (exactArticle) return exactArticle;

  const combinedSlugCandidates = routeSlugCandidates(routeSlug)
    .filter((candidate) => candidate.metaSlug)
    .map((candidate) => ({
      slug: candidate.slug,
      metaSlug: candidate.metaSlug as string,
    }));

  if (combinedSlugCandidates.length === 0) return null;

  const articles = await db.post.findMany({
    where: {
      isPublished: true,
      slug: { in: combinedSlugCandidates.map((candidate) => candidate.slug) },
    },
    include: publicArticleInclude,
  });

  return (
    combinedSlugCandidates
      .map((candidate) =>
        articles.find(
          (item) => item.slug === candidate.slug && item.metaSlug === candidate.metaSlug,
        ),
      )
      .find((item): item is NonNullable<typeof item> => Boolean(item)) ?? null
  );
}

async function findArticleMetadataByRouteSlug(routeSlug: string) {
  const exactArticle = await db.post.findFirst({
    where: { isPublished: true, slug: routeSlug },
    include: publicArticleMetadataInclude,
  });

  if (exactArticle) return exactArticle;

  const combinedSlugCandidates = routeSlugCandidates(routeSlug)
    .filter((candidate) => candidate.metaSlug)
    .map((candidate) => ({
      slug: candidate.slug,
      metaSlug: candidate.metaSlug as string,
    }));

  if (combinedSlugCandidates.length === 0) return null;

  const articles = await db.post.findMany({
    where: {
      isPublished: true,
      slug: { in: combinedSlugCandidates.map((candidate) => candidate.slug) },
    },
    include: publicArticleMetadataInclude,
  });

  return (
    combinedSlugCandidates
      .map((candidate) =>
        articles.find(
          (item) => item.slug === candidate.slug && item.metaSlug === candidate.metaSlug,
        ),
      )
      .find((item): item is NonNullable<typeof item> => Boolean(item)) ?? null
  );
}

export const getPublicRecipeByRouteSlug = unstable_cache(
  findRecipeByRouteSlug,
  ["public-recipe-by-route-slug-v1"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: ["recipes", "public-content"],
  },
);

export const getPublicRecipeMetadataByRouteSlug = unstable_cache(
  findRecipeMetadataByRouteSlug,
  ["public-recipe-metadata-by-route-slug-v1"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: ["recipes", "public-content"],
  },
);

export const getPublicArticleByRouteSlug = unstable_cache(
  findArticleByRouteSlug,
  ["public-article-by-route-slug-v1"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: ["articles", "public-content"],
  },
);

export const getPublicArticleMetadataByRouteSlug = unstable_cache(
  findArticleMetadataByRouteSlug,
  ["public-article-metadata-by-route-slug-v1"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: ["articles", "public-content"],
  },
);

export const getRecipeSidebarTaxonomy = unstable_cache(
  async (): Promise<{
    recipeCategories: RecipeCategories[];
    recipeMealTimes: MealTimes[];
    recipeTypes: RecipeTypes[];
  }> => {
    const [recipeCategories, recipeMealTimes, recipeTypes] = await Promise.all([
      db.recipeCategories.findMany({
        where: { isPublished: true },
        orderBy: [{ position: "asc" }, { name: "asc" }],
      }),
      db.mealTimes.findMany({
        where: { isPublished: true },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
      db.recipeTypes.findMany({
        where: { isPublished: true },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
    ]);

    return { recipeCategories, recipeMealTimes, recipeTypes };
  },
  ["recipe-sidebar-taxonomy-v1"],
  {
    revalidate: 60 * 60,
    tags: ["recipes", "navigation"],
  },
);

export const getPublicRelatedRecipes = unstable_cache(
  async (recipeId: string, categoryId?: string | null) => {
    return db.recipes.findMany({
      where: publishedRecipeAnd([
        { id: { not: recipeId } },
        { imageUrl: { not: null } },
        ...(categoryId ? [{ recipeCategoriesId: categoryId }] : []),
      ]),
      select: {
        id: true,
        title: true,
        slug: true,
        metaSlug: true,
        imageUrl: true,
        RecipeCategories: { select: { name: true } },
        recipeCookingTime: {
          select: { prepTime: true, cookTime: true, restTime: true },
        },
        recipeNutrient: {
          where: { nutrient: { isPublished: true } },
          select: { nutrient: { select: { title: true } } },
          take: 1,
        },
      },
      orderBy: [{ views: "desc" }, { contentUpdatedAt: "desc" }, { updatedAt: "desc" }],
      take: 10,
    });
  },
  ["public-related-recipes-v1"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: ["recipes", "public-content"],
  },
);
