import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { postId, commentId } = params;

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
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

    if (comment.token !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedComment = await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json(deletedComment, { status: 200 });
  } catch (error) {
    console.log("[COMMENT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: { postId: string; commentId: string };
  }
) {
  try {
    const { postId, commentId } = params;
    const { content } = await req.json();

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
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

    if (comment.token !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedComment = await db.comment.update({
      where: {
        id: commentId,
        recipeId: postId,
      },
      data: {
        content: content,
      },
    });

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    console.log("[COMMENT_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
