import { Queue } from "bullmq";
import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPersonalizationComplete } from "@/lib/personalization";

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });

    const body = await req.json();
    const cuisineIds: string[] = Array.isArray(body.cuisines) ? body.cuisines : [];
    const allergyIds: string[] = Array.isArray(body.allergies) ? body.allergies : [];

    await db.$transaction([
      db.userCuisines.deleteMany({ where: { userId: user.id } }),
      db.userAllrgies.deleteMany({ where: { userId: user.id } }),
      db.userCuisines.createMany({
        data: cuisineIds.map((cuisineId) => ({ userId: user.id, cuisineId })),
      }),
      db.userAllrgies.createMany({
        data: allergyIds.map((allergyId) => ({ userId: user.id, allergyId })),
      }),
    ]);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        foodPreferenceId: body.foodPreferences || null,
        cookingSkillId: body.cookingSkill || null,
      },
      include: {
        userCuisines: true,
        UserAllrgies: true,
      },
    });

    const isPersonalised = isPersonalizationComplete(updatedUser);
    const savedUser = await db.user.update({
      where: { id: user.id },
      data: { isPersonalised },
    });

    if (isPersonalised) {
      const mealPlanQueue = new Queue("generateMealPlan");
      await mealPlanQueue.add("generateMealPlan", { userId: user.id });
    }

    return NextResponse.json(savedUser, { status: 200 });
  } catch (error) {
    console.log("[USER_PERSONALISATION]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
