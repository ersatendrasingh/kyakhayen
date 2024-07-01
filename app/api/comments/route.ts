import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

interface CommentData {
  name: string;
  email: string;
  phoneNumber: string;
  comment: string;
  parentCommentId?: string;
  recipeId?: string;
  postId?: string;
  userId?: string;
  token: string;
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    const body: CommentData = await req.json();

    const name = user ? user.name : body.name;
    const email = user ? user.email : body.email;
    const phoneNumber = user ? user.phoneNumber : body.phoneNumber;
    const isPrimary = body.parentCommentId ? false : true;
    const savedComment = await db.comment.create({
      data: {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        content: body.comment,
        parentCommentId: body.parentCommentId,
        recipeId: body.recipeId,
        postId: body.postId,
        token: body.token,
        userId: user?.id,
        isPrimary: isPrimary,
      },
    });

    return NextResponse.json(savedComment, { status: 200 });
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
