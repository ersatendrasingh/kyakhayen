import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
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

    const body = await req.json();

    const heightWeight = body.heightWeight;

    const heightFt = parseInt(heightWeight.heightFt);
    const heightInch = parseInt(heightWeight.heightInch);
    const heightCm = parseInt(heightWeight.heightCm);
    const weightKg = parseFloat(heightWeight.weightKg);
    const weightLbs = parseFloat(heightWeight.weightLbs);

    // Convert height to meters
    const totalHeightInInches = heightFt * 12 + heightInch;
    const heightInMeters = totalHeightInInches * 0.0254;

    // Calculate BMI
    const bmi = weightKg / (heightInMeters * heightInMeters);

    // Round the BMI to two decimal places
    const roundedBMI = parseFloat(bmi.toFixed(2));

    const existingUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) {
      return NextResponse.json("User not found", {
        status: 404,
      });
    }

    await db.userCuisines.deleteMany({
      where: { userId: user.id },
    });

    // Add new cuisines for the user
    const cuisineArray = body.cuisines;
    const userCuisines = cuisineArray.map((cuisineId: string) => ({
      userId: user.id,
      cuisineId,
    }));

    await db.userCuisines.createMany({
      data: userCuisines,
    });

    await db.userHealthGoals.deleteMany({
      where: { userId: user.id },
    });

    const healthGoalsArray = body.healthGoals;
    const userHealthGoals = healthGoalsArray.map((healthGoalId: string) => ({
      userId: user.id,
      healthGoalId,
    }));

    await db.userHealthGoals.createMany({
      data: userHealthGoals,
    });
    await db.userAllrgies.deleteMany({
      where: { userId: user.id },
    });

    const allergiesArray = body.allergies;
    const userAllrgies = allergiesArray.map((allergyId: string) => ({
      userId: user.id,
      allergyId,
    }));

    await db.userAllrgies.createMany({
      data: userAllrgies,
    });

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
        dob: body.dob,
        age: body.age,
        genderId: body.gender,
        foodPreferenceId: body.foodPreferences,
        cookingSkillId: body.cookingSkill,
        prakritiId: mostFrequentPrakritiId,
        heightFt,
        heightInch,
        heightCm,
        weightKg,
        weightLbs,
        bmi: roundedBMI,
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
    console.log("[USER_PERSONALISATION]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
