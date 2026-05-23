import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, props: { params: Promise<{ recipeId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { recipeId } = params;

    const recipe = await db.recipes.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      return NextResponse.json("Recipe not found", { status: 404 });
    }

    if (!recipe.title || !recipe.description || !recipe.imageUrl) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }

    const publishedRecipe = await db.recipes.update({
      where: {
        id: recipeId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(publishedRecipe, { status: 200 });
  } catch (error) {
    console.log("[RECIPE_ID_PUBLISH]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
