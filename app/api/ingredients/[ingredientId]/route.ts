import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getIngredientSlug, normalizeIngredientName } from "@/lib/ingredients";

export async function DELETE(req: Request, props: { params: Promise<{ ingredientId: string }> }) {
  const params = await props.params;
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

    const deletedIngredient = await db.ingredients.delete({
      where: {
        id: ingredientId,
      },
    });
    return NextResponse.json(deletedIngredient, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENT_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ ingredientId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { ingredientId } = params;
    const { ...values } = await req.json();
    const data = values.name
      ? {
          ...values,
          name: normalizeIngredientName(values.name),
          slug: getIngredientSlug(values.name),
        }
      : values;

    const ingredient = await db.ingredients.update({
      where: {
        id: ingredientId,
      },
      data: {
        ...data,
      },
    });
    return NextResponse.json(ingredient, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENT_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
