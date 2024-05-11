import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const values = await req.json();

    const units = await db.units.create({
      data: {
        ...values,
      },
    });

    return NextResponse.json({ units }, { status: 200 });
  } catch (error) {
    console.log("[UNITS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
