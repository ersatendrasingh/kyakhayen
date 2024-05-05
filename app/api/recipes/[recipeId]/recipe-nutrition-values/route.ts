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
    const values = await req.json();
    const { recipeId } = params;
    const existingNutritionValues = await db.recipeNutritionValues.findFirst({
      where: {
        recipeId,
      },
    });

    if (existingNutritionValues) {
      // Update existing record
      const updatedNutritionValues = await db.recipeNutritionValues.update({
        where: {
          id: existingNutritionValues.id,
        },
        data: values, // Update existing fields with new values
      });
      return NextResponse.json(updatedNutritionValues, { status: 200 });
    } else {
      // Create new record
      const newNutritionValues = await db.recipeNutritionValues.create({
        data: {
          recipeId,
          ...values,
        },
      });
      return NextResponse.json(newNutritionValues, { status: 200 });
    }
  } catch (error) {
    console.log("[RECIPENUTRITIONVALUES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
