import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { allergyId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { allergyId } = params;

    const allergy = await db.allergies.findUnique({
      where: {
        id: allergyId,
      },
    });

    if (!allergy) {
      return NextResponse.json("Allergy not found", { status: 404 });
    }
    if (allergy.imageUrl) {
      const key = allergy.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(allergyId);

    const deletedAllergy = await db.allergies.delete({
      where: {
        id: allergyId,
      },
    });
    return NextResponse.json(deletedAllergy, { status: 200 });
  } catch (error) {
    console.log("[ALLERGY_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { allergyId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { allergyId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const allergy = await db.allergies.update({
      where: {
        id: allergyId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(allergy, { status: 200 });
  } catch (error) {
    console.log("[ALLERGYID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
