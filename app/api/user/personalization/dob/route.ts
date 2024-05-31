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

    const dob = body.dob ? new Date(body.dob) : null;
    const age = body.age ? parseInt(body.age) : null;

    const userRecord = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!userRecord) {
      return NextResponse.json("User not found", { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        dob,
        age,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_USER_DOB]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
