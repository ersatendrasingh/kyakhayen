import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
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
    if (recipe.imageUrl) {
      const key = recipe.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(recipeId);

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
export async function PATCH(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { recipeId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
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
