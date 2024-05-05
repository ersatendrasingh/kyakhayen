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
    const { diseaseValues } = await req.json();

    const existingRecipeDiseases = await db.recipeDisease.findMany({
      where: { recipeId },
      select: { diseaseId: true },
    });

    const existingDiseasesIds = existingRecipeDiseases.map(
      (item) => item.diseaseId
    );

    const newDiseaseIds = diseaseValues.filter(
      (disease: string) => !existingDiseasesIds.includes(disease)
    );

    const diseaseIdsToRemove = existingDiseasesIds.filter(
      (disease: string) => !diseaseValues.includes(disease)
    );

    // Add new cuisine IDs
    await Promise.all(
      newDiseaseIds.map(async (diseaseId: string) => {
        await db.recipeDisease.create({
          data: {
            recipeId,
            diseaseId,
          },
        });
      })
    );

    // Remove cuisine IDs
    await Promise.all(
      diseaseIdsToRemove.map(async (diseaseId: string) => {
        await db.recipeDisease.deleteMany({
          where: {
            recipeId,
            diseaseId,
          },
        });
      })
    );

    return NextResponse.json("Recipe diseases updated", { status: 200 });
  } catch (error) {
    console.log("[RECIPE_DISEASE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
