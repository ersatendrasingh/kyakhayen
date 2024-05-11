import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { recipeTypeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { recipeTypeId } = params;

    const recipeType = await db.recipeTypes.findUnique({
      where: {
        id: recipeTypeId,
      },
    });

    if (!recipeType) {
      return NextResponse.json("Recipe Type not found", { status: 404 });
    }
    if (recipeType.imageUrl) {
      const key = recipeType.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(recipeTypeId);

    const deletedRecipeType = await db.recipeTypes.delete({
      where: {
        id: recipeTypeId,
      },
    });
    return NextResponse.json(deletedRecipeType, { status: 200 });
  } catch (error) {
    console.log("[RECIPETYPE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { recipeTypeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { recipeTypeId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const recipeType = await db.recipeTypes.update({
      where: {
        id: recipeTypeId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(recipeType, { status: 200 });
  } catch (error) {
    console.log("[RECIPETYPE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
