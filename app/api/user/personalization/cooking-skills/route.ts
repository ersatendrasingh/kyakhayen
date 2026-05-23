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

    const { userId, newCookingSkill } = await req.json();

    const userRecord = await db.user.findUnique({
      where: { id: userId },
      include: { cookingSkill: true },
    });

    if (!userRecord) {
      return NextResponse.json("User not found", { status: 404 });
    }

    // Check if the cooking skill needs to be updated
    const shouldUpdateCookingSkill =
      !userRecord.cookingSkill ||
      userRecord.cookingSkill.id !== newCookingSkill.id;

    if (shouldUpdateCookingSkill) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { cookingSkillId: newCookingSkill.id },
        include: {
          userCuisines: true,
          UserAllrgies: true,
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
    console.error("[UPDATE_COOKING_SKILL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
