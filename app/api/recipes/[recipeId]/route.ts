import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  deleteFolderFromS3,
} from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { normalizeRecipeTitle } from "@/lib/recipe-seo";
import { slugify } from "@/lib/slugify";

export async function DELETE(req: Request, props: { params: Promise<{ recipeId: string }> }) {
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
    await deleteFolderFromS3(`recipes/${recipeId}`);

    const deletedRecipe = await db.recipes.delete({
      where: {
        id: recipeId,
      },
    });
    return NextResponse.json(deletedRecipe, { status: 200 });
  } catch (error) {
    console.log("[RECIPE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ recipeId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { recipeId } = params;
    const { title: requestedTitle, ...values } = await req.json();
    const title = requestedTitle ? normalizeRecipeTitle(requestedTitle) : undefined;
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
      const existing = await db.recipes.findUnique({ where: { slug }, select: { id: true } });
      if (existing && existing.id !== recipeId) {
        return NextResponse.json(
          "A recipe with this title already exists. Use a descriptive variation such as cuisine or style.",
          { status: 409 }
        );
      }
    }

    const recipe = await db.recipes.update({
      where: {
        id: recipeId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    console.log("[RECIPE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
