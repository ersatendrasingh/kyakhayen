import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { ingredientId } = params;

    const ingredient = await db.ingredients.findUnique({
      where: {
        id: ingredientId,
      },
    });

    if (!ingredient) {
      return NextResponse.json("Ingredient not found", { status: 404 });
    }

    if (!ingredient.name || !ingredient.ingredientCategoriesId) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }

    const publishedIngredient = await db.ingredients.update({
      where: {
        id: ingredientId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(publishedIngredient, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENT_ID_PUBLISH]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
