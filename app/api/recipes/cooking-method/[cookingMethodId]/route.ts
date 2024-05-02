import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { cookingMethodId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { cookingMethodId } = params;

    const cookingMethod = await db.cookingMethods.findUnique({
      where: {
        id: cookingMethodId,
      },
    });

    if (!cookingMethod) {
      return NextResponse.json("Cooking Method not found", { status: 404 });
    }
    if (cookingMethod.imageUrl) {
      const key = cookingMethod.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(cookingMethodId);

    const deletedCookingMethod = await db.cookingMethods.delete({
      where: {
        id: cookingMethodId,
      },
    });
    return NextResponse.json(deletedCookingMethod, { status: 200 });
  } catch (error) {
    console.log("[COOKINGMETHOD_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { cookingMethodId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { cookingMethodId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const cookingMethod = await db.cookingMethods.update({
      where: {
        id: cookingMethodId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(cookingMethod, { status: 200 });
  } catch (error) {
    console.log("[COOKINGMETHODID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
