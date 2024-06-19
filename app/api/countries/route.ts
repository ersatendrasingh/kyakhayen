import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const countries = await db.country.findMany({
      orderBy: {
        countryCode: "asc",
      },
    });

    return NextResponse.json(countries, {
      status: 200,
    });
  } catch (error) {
    console.log("[COUNTRIES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
