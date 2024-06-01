import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { isPersonalizationComplete } from "@/lib/personalization";
interface PrakritiSelection {
  prakritiId: string;
  questionId: string;
  optionId: string;
}
export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const userRecord = await db.user.findUnique({
      where: { id: user.id },
      include: { gender: true },
    });

    if (!userRecord) {
      return NextResponse.json("User not found", { status: 404 });
    }
    const body = await req.json();
    await db.userPrakriti.deleteMany({
      where: { userId: user.id },
    });
    const prakritiArray: PrakritiSelection[] = body.prakritiSelections;
    const userPrakritis = prakritiArray.map((selection: PrakritiSelection) => ({
      userId: user.id,
      prakritiId: selection.prakritiId,
      questionId: selection.questionId,
      optionId: selection.optionId,
    }));

    await db.userPrakriti.createMany({
      data: userPrakritis,
    });
    const prakritiCounts: { [key: string]: number } = prakritiArray.reduce(
      (acc, selection: PrakritiSelection) => {
        acc[selection.prakritiId] = (acc[selection.prakritiId] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    const mostFrequentPrakritiId = Object.keys(prakritiCounts).reduce((a, b) =>
      prakritiCounts[a] > prakritiCounts[b] ? a : b
    );

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        prakritiId: mostFrequentPrakritiId,
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
    console.log("isPersonalised", isPersonalised);
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        isPersonalised,
      },
    });
    return NextResponse.json(updatedUser, {
      status: 200,
    });
  } catch (error) {
    console.error("[UPDATE_PRAKRITI]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
