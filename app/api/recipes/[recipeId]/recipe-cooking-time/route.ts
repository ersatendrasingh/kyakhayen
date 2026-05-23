import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ recipeId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const { recipeId } = params;
    const existingRecipeTime = await db.recipeCookingTime.findFirst({
      where: {
        recipeId,
      },
    });

    if (existingRecipeTime) {
      // Update existing record
      const updatedRecipeTime = await db.recipeCookingTime.update({
        where: {
          id: existingRecipeTime.id,
        },
        data: values, // Update existing fields with new values
      });
      return NextResponse.json(updatedRecipeTime, { status: 200 });
    } else {
      // Create new record
      const newRecipeTime = await db.recipeCookingTime.create({
        data: {
          recipeId,
          ...values,
        },
      });
      return NextResponse.json(newRecipeTime, { status: 200 });
    }
  } catch (error) {
    console.log("[RECIPECOOKINGTIME]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
