import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const ingredient = await db.ingredients.findUnique({
      where: {
        id: params.ingredientId,
      },
    });

    if (!ingredient) {
      return NextResponse.json("Ingredient not found", { status: 404 });
    }

    const { unitId, values } = await req.json();

    const unitMeasurements = await db.ingredientUnitMeasurements.findFirst({
      where: {
        ingredientId: params.ingredientId,
        unitId,
      },
    });

    let updatedUnitMeasurements;

    if (!unitMeasurements) {
      updatedUnitMeasurements = await db.ingredientUnitMeasurements.create({
        data: {
          ingredientId: params.ingredientId,
          unitId,
          values,
        },
      });
    } else {
      updatedUnitMeasurements = await db.ingredientUnitMeasurements.updateMany({
        where: {
          ingredientId: params.ingredientId,
          unitId: unitId as string,
        },
        data: {
          values,
        },
      });
    }

    console.log(updatedUnitMeasurements);
    return NextResponse.json(updatedUnitMeasurements, { status: 200 });

    return NextResponse.json(unitMeasurements, { status: 200 });
  } catch (error) {
    console.log("UNIT_MEASUREMENT", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
