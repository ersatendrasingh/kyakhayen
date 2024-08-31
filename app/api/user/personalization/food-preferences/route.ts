import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { isPersonalizationComplete } from "@/lib/personalization";
import { Queue } from "bullmq";

export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { userId, newPreference } = await req.json();

    const userRecord = await db.user.findUnique({
      where: { id: userId },
      include: { foodPreference: true },
    });

    if (!userRecord) {
      return NextResponse.json("User not found", { status: 404 });
    }

    // Update the food preference if it's different or if the user has no current preference
    const shouldUpdatePreference =
      !userRecord.foodPreference ||
      userRecord.foodPreference.id !== newPreference.id;

    if (shouldUpdatePreference) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { foodPreferenceId: newPreference.id },
        include: {
          userCuisines: true,
          UserHealthGoals: true,
          UserAllrgies: true,
          userPrakriti: true,
        },
      });
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
    }

    return NextResponse.json(userRecord, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_FOOD_PREFERENCE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
