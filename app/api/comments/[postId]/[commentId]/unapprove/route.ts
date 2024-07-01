import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params: { postId, commentId },
  }: { params: { postId: string; commentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const existingComment = await db.comment.findUnique({
      where: {
        id: commentId,
        recipeId: postId,
      },
    });
    if (!existingComment) {
      return NextResponse.json("Comment not found", { status: 404 });
    }
    if (!existingComment.isPublished) {
      return NextResponse.json("Comment already unapproved", { status: 409 });
    }
    const unApprovedComment = await db.comment.update({
      where: {
        id: commentId,
        recipeId: postId,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unApprovedComment, { status: 200 });
  } catch (error) {
    console.log("COMMENT_UNAPPROVE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
