import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { userId, newHealthGoal } = await req.json();

    const existingUserHealthGoals = await db.userHealthGoals.findUnique({
      where: {
        userId_healthGoalId: {
          userId: userId,
          healthGoalId: newHealthGoal.id,
        },
      },
    });

    if (!existingUserHealthGoals) {
      await db.userHealthGoals.create({
        data: {
          userId: userId,
          healthGoalId: newHealthGoal.id,
        },
      });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("[ADD_HEALTH_GOAL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { userId, healthGoalId } = await req.json();

    await db.userHealthGoals.delete({
      where: {
        userId_healthGoalId: {
          userId: userId,
          healthGoalId: healthGoalId,
        },
      },
    });

    return NextResponse.json("Health goal deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[DELETE_HEALTH_GOAL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
