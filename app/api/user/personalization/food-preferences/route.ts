import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { updateMealPlan } from "@/actions/update-meal-plan"; // Assuming this is where your meal plan generation function resides

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

    // Check if the food preference needs to be updated
    if (
      userRecord.foodPreference &&
      userRecord.foodPreference.id !== newPreference.id
    ) {
      await db.user.update({
        where: { id: userId },
        data: { foodPreferenceId: newPreference.id },
      });

      // Generate or regenerate meal plan after updating food preference
      await updateMealPlan(); // Call generateMealPlan function here
    } else if (!userRecord.foodPreference) {
      await db.user.update({
        where: { id: userId },
        data: { foodPreferenceId: newPreference.id },
      });

      // Generate or regenerate meal plan after setting initial food preference
      await updateMealPlan(); // Call generateMealPlan function here
    }

    return NextResponse.json(userRecord, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_FOOD_PREFERENCE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
