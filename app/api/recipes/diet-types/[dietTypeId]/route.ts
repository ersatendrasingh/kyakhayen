import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { dietTypeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { dietTypeId } = params;

    const dietType = await db.dietTypes.findUnique({
      where: {
        id: dietTypeId,
      },
    });

    if (!dietType) {
      return NextResponse.json("Diet Type not found", { status: 404 });
    }
    if (dietType.imageUrl) {
      const key = dietType.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(dietTypeId);

    const deletedDietType = await db.dietTypes.delete({
      where: {
        id: dietTypeId,
      },
    });
    return NextResponse.json(deletedDietType, { status: 200 });
  } catch (error) {
    console.log("[DIETTYPE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { dietTypeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { dietTypeId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const dietType = await db.dietTypes.update({
      where: {
        id: dietTypeId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(dietType, { status: 200 });
  } catch (error) {
    console.log("[DIETTYPE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
