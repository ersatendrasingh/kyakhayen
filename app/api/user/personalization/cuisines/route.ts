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
    const { userId, newCuisine } = await req.json();

    // Fetch existing user cuisines
    const existingUserCuisine = await db.userCuisines.findUnique({
      where: {
        userId_cuisineId: {
          userId: userId,
          cuisineId: newCuisine.id,
        },
      },
    });

    // If the cuisine is not already associated, add it to userCuisines table
    if (!existingUserCuisine) {
      await db.userCuisines.create({
        data: {
          userId: userId,
          cuisineId: newCuisine.id,
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
    console.error("[ADD_CUISINE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { userId, cuisineId } = await req.json();

    await db.userCuisines.delete({
      where: {
        userId_cuisineId: {
          userId: userId,
          cuisineId: cuisineId,
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
    return NextResponse.json("Cuisine deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[DELETE_CUISINE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
