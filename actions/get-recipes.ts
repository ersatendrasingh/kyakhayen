import { RecipeCategories, Recipes } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
};

type GetRecipes = {
  title?: string;
  recipeCategoriesId?: string;
};

export const GetRecipes = async ({
  title,
  recipeCategoriesId,
}: GetRecipes): Promise<RecipeWithCategory[]> => {
  try {
    const user = await currentUser();
    if (!user) {
      const userId = undefined;
    }
    const userId = user?.id;
    user;
    const recipes = await db.recipes.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        recipeCategoriesId,
      },
      include: {
        RecipeCategories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return recipes;
  } catch (error) {
    console.log("[GET_RECIPES]", error);
    return [];
  }
};
