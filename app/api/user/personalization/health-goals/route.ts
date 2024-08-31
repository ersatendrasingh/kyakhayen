import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPersonalizationComplete } from "@/lib/personalization";
import { Queue } from "bullmq";
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
    const updatedUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
      include: {
        userCuisines: true,
        UserHealthGoals: true,
        UserAllrgies: true,
        userPrakriti: true,
      },
    });

    // Check if personalization is complete
    const isPersonalised = isPersonalizationComplete(updatedUser);

    if (isPersonalised) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          isPersonalised,
        },
      });

      //Call the generate meal plan queue
      const mealPlanQueue = new Queue("generateMealPlan");
      await mealPlanQueue.add("generateMealPlan", { userId: user.id });
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
    const updatedUser = await db.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        userCuisines: true,
        UserHealthGoals: true,
        UserAllrgies: true,
        userPrakriti: true,
      },
    });

    // Check if personalization is complete
    const isPersonalised = isPersonalizationComplete(updatedUser);

    if (isPersonalised) {
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          isPersonalised,
        },
      });

      //Call the generate meal plan queue
      const mealPlanQueue = new Queue("generateMealPlan");
      await mealPlanQueue.add("generateMealPlan", { userId: userId });
    }
    return NextResponse.json("Health goal deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[DELETE_HEALTH_GOAL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
