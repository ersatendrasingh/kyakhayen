import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { articleId } = params;
    const { categoriesValues } = await req.json();

    const existingArticlesCategories = await db.postCategory.findMany({
      where: { postId: articleId },
      select: { categoryId: true },
    });

    const existingCategoriesIds = existingArticlesCategories.map(
      (item) => item.categoryId
    );

    const newCategoriesIds = categoriesValues.filter(
      (category: string) => !existingCategoriesIds.includes(category)
    );

    const categoriesIdsToRemove = existingCategoriesIds.filter(
      (category: string) => !categoriesValues.includes(category)
    );

    await Promise.all(
      newCategoriesIds.map(async (categoryId: string) => {
        await db.postCategory.create({
          data: {
            postId: articleId,
            categoryId,
          },
        });
      })
    );

    await Promise.all(
      categoriesIdsToRemove.map(async (categoryId: string) => {
        await db.postCategory.deleteMany({
          where: {
            postId: articleId,
            categoryId,
          },
        });
      })
    );

    return NextResponse.json("Article categories updated", { status: 200 });
  } catch (error) {
    console.log("[ARTICLE_CATEGORIES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
