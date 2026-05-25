import MobileHeader from "@/components/header/mobile-header";
import DesktopHeader from "@/components/header/desktop-header";
import { db } from "@/lib/db";

export const Header = async () => {
  const [mealTimes, cuisines, categories, recipeTypes] = await Promise.all([
    db.mealTimes.findMany({
      where: {
        isPublished: true,
        recipeMealTime: {
          some: { recipe: { isPublished: true, imageUrl: { not: null } } },
        },
      },
      select: { title: true, slug: true, imageUrl: true },
      orderBy: { position: "asc" },
    }),
    db.cuisines.findMany({
      where: {
        isPublished: true,
        recipeCuisine: {
          some: { recipe: { isPublished: true, imageUrl: { not: null } } },
        },
      },
      select: {
        title: true,
        slug: true,
        imageUrl: true,
        _count: { select: { recipeCuisine: true } },
      },
      orderBy: { title: "asc" },
    }),
    db.recipeCategories.findMany({
      where: {
        isPublished: true,
        recipe: { some: { isPublished: true, imageUrl: { not: null } } },
      },
      select: { name: true, slug: true, imageUrl: true },
      orderBy: { position: "asc" },
    }),
    db.recipeTypes.findMany({
      where: {
        isPublished: true,
        recipeRecipeType: {
          some: { recipe: { isPublished: true, imageUrl: { not: null } } },
        },
      },
      select: {
        title: true,
        slug: true,
        imageUrl: true,
        recipeRecipeType: {
          where: { recipe: { isPublished: true, imageUrl: { not: null } } },
          select: { recipe: { select: { imageUrl: true } } },
          take: 1,
        },
      },
      orderBy: { position: "asc" },
      take: 8,
    }),
  ]);
  const orderedCuisines = [...cuisines].sort((left, right) => {
    if (left.slug === "north-indian") return -1;
    if (right.slug === "north-indian") return 1;

    return (
      right._count.recipeCuisine - left._count.recipeCuisine ||
      left.title.localeCompare(right.title)
    );
  });
  const mappedRecipeTypes = recipeTypes.map((type) => ({
    title: type.title,
    slug: type.slug,
    imageUrl:
      type.imageUrl || type.recipeRecipeType[0]?.recipe.imageUrl || null,
  }));

  return (
    <>
      <DesktopHeader
        mealTimes={mealTimes}
        cuisines={orderedCuisines}
        categories={categories}
        recipeTypes={mappedRecipeTypes}
      />
      <MobileHeader
        mealTimes={mealTimes}
        cuisines={orderedCuisines}
        categories={categories}
        recipeTypes={mappedRecipeTypes}
      />
    </>
  );
};
