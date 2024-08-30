import { NextResponse } from "next/server";
import { generateMealPlan } from "@/actions/generate-meal-plan";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 }
      );
    }

    // Call the action function
    await generateMealPlan(userId);
    return NextResponse.json("Meal plan generated", { status: 200 });
  } catch (error) {
    console.log("[GENERATE_MEAL_PLAN]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
