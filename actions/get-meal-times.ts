"use server";

import { db } from "@/lib/db";

import { MealTimes } from "@prisma/client";

export const getMealTimes = async (): Promise<MealTimes[]> => {
  try {
    const mealTimes = await db.mealTimes.findMany();

    return mealTimes;
  } catch (error) {
    console.error("[GET_MEAL_TIMES]", error);
    return [];
  }
};
