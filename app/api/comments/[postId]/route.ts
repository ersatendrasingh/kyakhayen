import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    const user = await currentUser();
    if (!postId) {
      return NextResponse.json("Recipe ID is required", { status: 400 });
    }

    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const comments = await db.comment.findMany({
      where: {
        recipeId: postId as string,
        OR: [{ isPublished: true }, { userId: user.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("[GET_COMMENT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
