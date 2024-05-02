import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { cuisineId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { cuisineId } = params;

    const cuisine = await db.cuisines.findUnique({
      where: {
        id: cuisineId,
      },
    });

    if (!cuisine) {
      return NextResponse.json("Cuisine not found", { status: 404 });
    }
    if (cuisine.imageUrl) {
      const key = cuisine.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(cuisineId);

    const deletedCuisine = await db.cuisines.delete({
      where: {
        id: cuisineId,
      },
    });
    return NextResponse.json(deletedCuisine, { status: 200 });
  } catch (error) {
    console.log("[CUISINE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { cuisineId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { cuisineId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const cuisine = await db.cuisines.update({
      where: {
        id: cuisineId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(cuisine, { status: 200 });
  } catch (error) {
    console.log("[CUISINEID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
