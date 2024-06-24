import { auth } from "@/auth";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const userEmail = session?.user.email;
    const { firebaseToken } = await req.json();

    const updatedUser = await db.user.update({
      where: {
        email: userEmail!,
      },
      data: {
        firebaseToken: firebaseToken,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.log("[USER_FIREBASE_TOKEN_SAVE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
