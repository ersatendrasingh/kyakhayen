import { Prisma } from "@prisma/client";

import { RecipesDashboard } from "@/components/admin/recipes/recipes-dashboard";
import type { RecipeListRecord } from "@/components/admin/recipes/recipe-types";
import { db } from "@/lib/db";

const PAGE_SIZE = 12;

type RecipeSearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  cuisine?: string | string[];
  mealTime?: string | string[];
  status?: string | string[];
  page?: string | string[];
}>;

const singleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

const contentReadyFilter: Prisma.RecipesWhereInput = {
  description: { not: null },
  imageUrl: { not: null },
  recipeIngredients: { some: {} },
  recipeMethods: { some: {} },
};

const RecipesPage = async ({
  searchParams,
}: {
  searchParams: RecipeSearchParams;
}) => {
  const params = await searchParams;
  const search = singleParam(params.q).trim();
  const categoryId = singleParam(params.category);
  const cuisineId = singleParam(params.cuisine);
  const mealTimeId = singleParam(params.mealTime);
  const status = singleParam(params.status);
  const requestedPage = Math.max(
    Number.parseInt(singleParam(params.page) || "1", 10) || 1,
    1
  );

  const where: Prisma.RecipesWhereInput = {
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : {}),
    ...(categoryId ? { recipeCategoriesId: categoryId } : {}),
    ...(cuisineId
      ? { recipeCuisine: { some: { cuisineId } } }
      : {}),
    ...(mealTimeId
      ? { recipeMealTime: { some: { mealTimeId } } }
      : {}),
    ...(status === "published"
      ? { isPublished: true }
      : status === "draft"
        ? { isPublished: false }
        : status === "incomplete"
          ? { NOT: contentReadyFilter }
          : {}),
  };

  const [
    total,
    published,
    contentReady,
    totalFiltered,
    categories,
    cuisines,
    mealTimes,
  ] = await Promise.all([
    db.recipes.count(),
    db.recipes.count({ where: { isPublished: true } }),
    db.recipes.count({ where: contentReadyFilter }),
    db.recipes.count({ where }),
    db.recipeCategories.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.cuisines.findMany({
      where: { recipeCuisine: { some: {} } },
      orderBy: [{ position: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
    db.mealTimes.findMany({
      where: { recipeMealTime: { some: {} } },
      orderBy: [{ position: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
  ]);

  const pageCount = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1);
  const page = Math.min(requestedPage, pageCount);
  const entries = await db.recipes.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      RecipeCategories: { select: { id: true, name: true } },
      _count: { select: { recipeIngredients: true, recipeMethods: true } },
    },
  });

  const recipes: RecipeListRecord[] = entries.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    isPublished: recipe.isPublished,
    updatedAt: recipe.updatedAt.toISOString(),
    category: recipe.RecipeCategories,
    ingredientCount: recipe._count.recipeIngredients,
    methodCount: recipe._count.recipeMethods,
  }));

  return (
    <RecipesDashboard
      key={[search, categoryId, cuisineId, mealTimeId, status, page].join(":")}
      recipes={recipes}
      categories={categories.map((category) => ({ id: category.id, label: category.name }))}
      cuisines={cuisines.map((cuisine) => ({ id: cuisine.id, label: cuisine.title }))}
      mealTimes={mealTimes.map((mealTime) => ({ id: mealTime.id, label: mealTime.title }))}
      stats={{
        total,
        published,
        drafts: total - published,
        contentReady,
      }}
      filters={{ search, categoryId, cuisineId, mealTimeId, status }}
      page={page}
      pageCount={pageCount}
      totalFiltered={totalFiltered}
    />
  );
};

export default RecipesPage;
