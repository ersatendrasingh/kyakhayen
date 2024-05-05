import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { healthGoalId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { healthGoalId } = params;

    const healthGoal = await db.healthGoals.findUnique({
      where: {
        id: healthGoalId,
      },
    });

    if (!healthGoal) {
      return NextResponse.json("Health Goal not found", { status: 404 });
    }
    if (healthGoal.imageUrl) {
      const key = healthGoal.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(healthGoalId);

    const deletedHealthGoal = await db.healthGoals.delete({
      where: {
        id: healthGoalId,
      },
    });
    return NextResponse.json(deletedHealthGoal, { status: 200 });
  } catch (error) {
    console.log("[HEALTH_GOAL_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { healthGoalId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { healthGoalId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const healthGoal = await db.healthGoals.update({
      where: {
        id: healthGoalId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(healthGoal, { status: 200 });
  } catch (error) {
    console.log("[HEALTH_GOAL_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
