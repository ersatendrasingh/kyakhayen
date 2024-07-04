import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const userId = user.id;
    const { recipeId } = await req.json();
    if (!recipeId) {
      return NextResponse.json("Missing recipeId", { status: 400 });
    }

    const viewedRecipe = await db.userRecipeViews.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (!viewedRecipe) {
      // Record that this IP address has viewed this recipe
      await db.userRecipeViews.create({
        data: { recipeId, userId },
      });
    }

    return NextResponse.json("View Count Updated", { status: 200 });
  } catch (error) {
    console.log("[USER_RECIPE_TRACK_VIEWS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
