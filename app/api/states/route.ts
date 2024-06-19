import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: any) {
  try {
    const countryId = req.nextUrl.searchParams.get("countryId");
    const states = await db.state.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        countryId: Number(countryId),
      },
    });
    return NextResponse.json(states, { status: 200 });
  } catch (error) {
    console.log("[GET_STATES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
