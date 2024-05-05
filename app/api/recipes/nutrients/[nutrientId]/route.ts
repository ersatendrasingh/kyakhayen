import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { nutrientId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { nutrientId } = params;

    const nutrient = await db.nutrient.findUnique({
      where: {
        id: nutrientId,
      },
    });

    if (!nutrient) {
      return NextResponse.json("Nutrient not found", { status: 404 });
    }
    if (nutrient.imageUrl) {
      const key = nutrient.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(nutrientId);

    const deletedNutrient = await db.nutrient.delete({
      where: {
        id: nutrientId,
      },
    });
    return NextResponse.json(deletedNutrient, { status: 200 });
  } catch (error) {
    console.log("[NUTRIENT_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { nutrientId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { nutrientId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const nutrient = await db.nutrient.update({
      where: {
        id: nutrientId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(nutrient, { status: 200 });
  } catch (error) {
    console.log("[NUTRIENTID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
