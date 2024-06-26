import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Comment } from "@/types/comment";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = params;
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const phoneNumber = url.searchParams.get("phoneNumber");
    const user = await currentUser();
    if (!recipeId) {
      return NextResponse.json("Recipe ID is required", { status: 400 });
    }
    let comments: Comment[];

    if (user) {
      comments = await db.comment.findMany({
        where: {
          recipeId: recipeId as string,
          OR: [
            { isPublished: true },
            { userId: user.id },
            {
              AND: [{ email: user.email }, { email }, { phoneNumber }],
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      comments = await db.comment.findMany({
        where: {
          recipeId: recipeId as string,
          OR: [
            { isPublished: true },
            {
              AND: [{ email }, { phoneNumber }],
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("[GET_COMMENT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
