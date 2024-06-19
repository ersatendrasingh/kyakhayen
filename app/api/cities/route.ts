import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: any) {
  try {
    const stateId = req.nextUrl.searchParams.get("stateId");
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
