import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { mealTimeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { mealTimeId } = params;

    const mealTime = await db.mealTimes.findUnique({
      where: {
        id: mealTimeId,
      },
    });

    if (!mealTime) {
      return NextResponse.json("Meal time not found", { status: 404 });
    }
    if (mealTime.imageUrl) {
      const key = mealTime.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(mealTimeId);

    const deletedMealTime = await db.mealTimes.delete({
      where: {
        id: mealTimeId,
      },
    });
    return NextResponse.json(deletedMealTime, { status: 200 });
  } catch (error) {
    console.log("[MEALTIME_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { mealTimeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { mealTimeId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const mealTime = await db.mealTimes.update({
      where: {
        id: mealTimeId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(mealTime, { status: 200 });
  } catch (error) {
    console.log("[MEALTIMEID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
