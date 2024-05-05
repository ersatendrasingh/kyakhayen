import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { recipeId } = params;
    const { healthGoalValues } = await req.json();

    const existingRecipeHealthGoals = await db.recipeHealthGoals.findMany({
      where: { recipeId },
      select: { healthGoalId: true },
    });

    const existingHealthGoalsIds = existingRecipeHealthGoals.map(
      (item) => item.healthGoalId
    );

    const newHealthGoalIds = healthGoalValues.filter(
      (healthGoal: string) => !existingHealthGoalsIds.includes(healthGoal)
    );

    const healthGoalIdsToRemove = existingHealthGoalsIds.filter(
      (healthGoal: string) => !healthGoalValues.includes(healthGoal)
    );

    await Promise.all(
      newHealthGoalIds.map(async (healthGoalId: string) => {
        await db.recipeHealthGoals.create({
          data: {
            recipeId,
            healthGoalId,
          },
        });
      })
    );

    await Promise.all(
      healthGoalIdsToRemove.map(async (healthGoalId: string) => {
        await db.recipeHealthGoals.deleteMany({
          where: {
            recipeId,
            healthGoalId,
          },
        });
      })
    );

    return NextResponse.json("Recipe health goals updated", { status: 200 });
  } catch (error) {
    console.log("[RECIPE_HEALTHGOAL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
