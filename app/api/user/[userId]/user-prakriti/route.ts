import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const prakritis = await db.userPrakriti.findMany({
      where: {
        userId: params.userId,
      },
    });

    return NextResponse.json(prakritis, { status: 200 });
  } catch (error) {
    console.log("[USER_PRAKRITI]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
