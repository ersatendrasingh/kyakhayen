import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

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

    if (
      userRecord.cookingSkill &&
      userRecord.cookingSkill.id !== newCookingSkill.id
    ) {
      await db.user.update({
        where: { id: userId },
        data: { cookingSkillId: newCookingSkill.id },
      });
    } else if (!userRecord.cookingSkill) {
      await db.user.update({
        where: { id: userId },
        data: { cookingSkillId: newCookingSkill.id },
      });
    }

    return NextResponse.json(userRecord, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_COOKING_SKILL]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
