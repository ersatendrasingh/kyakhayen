import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { question } = await req.json();

    const prakritiQuestion = await db.prakritiQuestion.create({
      data: {
        question,
      },
    });
    return NextResponse.json(prakritiQuestion, { status: 200 });
  } catch (error) {
    console.log("[PRAKRITIQUESTION]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
