import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { recipeId: string; benefitId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { recipeId, benefitId } = params;
    const benefit = await db.recipeHealthBenefits.findUnique({
      where: {
        id: params.benefitId,
        recipeId: params.recipeId,
      },
    });
    if (!benefit) {
      return NextResponse.json("Benefit not found", { status: 404 });
    }

    // delete benefit
    const deletedBenefit = await db.recipeHealthBenefits.delete({
      where: {
        id: benefitId,
        recipeId: recipeId,
      },
    });
    return NextResponse.json(deletedBenefit, {
      status: 200,
    });
  } catch (error) {
    console.log("[BENEFIT_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { recipeId: string; benefitId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const benefit = await db.recipeHealthBenefits.findUnique({
      where: {
        id: params.benefitId,
        recipeId: params.recipeId,
      },
    });
    if (!benefit) {
      return NextResponse.json("Benefit not found", { status: 404 });
    }
    if (values) {
      const updatedBenefit = await db.recipeHealthBenefits.update({
        where: {
          id: params.benefitId,
          recipeId: params.recipeId,
        },
        data: {
          ...values,
        },
      });
      return NextResponse.json(updatedBenefit, { status: 200 });
    }
  } catch (error) {
    console.log("[RECIPEBENEFITUPDATE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
