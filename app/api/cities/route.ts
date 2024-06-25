import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stateId = body.stateId;
    const cities = await db.city.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        stateId: Number(stateId),
      },
    });
    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.log("[GET_CITIES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
