import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { postId, commentId } = params;
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
        recipeId: postId, // Ensure the comment belongs to the correct recipe
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const deletedComment = await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json(deletedComment, { status: 200 });
  } catch (error) {
    console.log("[COMMENT_DELETE_ADMIN]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
