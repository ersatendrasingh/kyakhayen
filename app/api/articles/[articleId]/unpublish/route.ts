import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { articleId } = params;

    const post = await db.post.findUnique({
      where: {
        id: articleId,
      },
    });

    if (!post) {
      return NextResponse.json("Article not found", { status: 404 });
    }

    const unPublishedArticle = await db.post.update({
      where: {
        id: articleId,
      },
      data: {
        isPublished: false,
      },
    });
    return NextResponse.json(unPublishedArticle, { status: 200 });
  } catch (error) {
    console.log("[ARTICLE_ID_UNPUBLISH]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
