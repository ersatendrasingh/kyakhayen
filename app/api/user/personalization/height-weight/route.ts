import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    const heightFt = parseInt(body.heightFt);
    const heightInch = parseInt(body.heightInch);
    const heightCm = parseInt(body.heightCm);
    const weightKg = parseFloat(body.weightKg);
    const weightLbs = parseFloat(body.weightLbs);

    // Convert height to meters
    const totalHeightInInches = heightFt * 12 + heightInch;
    const heightInMeters = totalHeightInInches * 0.0254;

    // Calculate BMI
    const bmi = weightKg / (heightInMeters * heightInMeters);

    // Round the BMI to two decimal places
    const roundedBMI = parseFloat(bmi.toFixed(2));
    const userRecord = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!userRecord) {
      return NextResponse.json("User not found", { status: 404 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        heightFt,
        heightInch,
        heightCm,
        weightKg,
        weightLbs,
        bmi: roundedBMI,
      },
    });

    return NextResponse.json(userRecord, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_HEIGHT_WEIGHT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
