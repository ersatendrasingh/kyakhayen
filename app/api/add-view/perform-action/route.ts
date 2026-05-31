import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { recipeId, userId } = await req.json();

    if (!recipeId) {
      return NextResponse.json("Missing recipeId", { status: 400 });
    }

    // Use upsert to avoid unique constraint violations
    if (userId) {
      await db.userRecipeViews.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: {
          userId,
          recipeId,
        },
      });
    } else {
      let ipAddress: string | undefined;

      if (req.headers.get("x-forwarded-for")) {
        ipAddress = req.headers.get("x-forwarded-for") as string;
      } else if (req.headers.get("x-real-ip")) {
        ipAddress = req.headers.get("x-real-ip") as string;
      }

      if (!ipAddress) {
        return NextResponse.json("Missing IP address", { status: 400 });
      }
      const viewedRecipe = await db.recipeViews.findUnique({
        where: { recipeId_ipAddress: { recipeId, ipAddress } },
      });

      if (!viewedRecipe) {
        // Increment unique views count in the database
        await db.recipes.update({
          where: {
            id: recipeId,
          },
          data: {
            views: {
              increment: 1,
            },
          },
        });

        // Record that this IP address has viewed this recipe
        await db.recipeViews.create({
          data: { recipeId, ipAddress },
        });
      }
    }

    return NextResponse.json("View Count Updated", {
      status: 200,
    });
  } catch (error) {
    console.log("[USER_RECIPE_ADD_VIEWS_PERFORM]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
