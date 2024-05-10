import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { name } = await req.json();

    const ingredient = await db.ingredients.create({
      data: {
        name,
      },
    });
    return NextResponse.json(ingredient, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENTS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
