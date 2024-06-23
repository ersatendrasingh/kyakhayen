import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { db } from "@/lib/db"; // Your database setup

export async function POST(req: NextRequest) {
  try {
    const { email, notification } = await req.json();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.firebaseToken) {
      return NextResponse.json("User not found or missing token", {
        status: 404,
      });
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      token: user.firebaseToken,
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({ success: true, response }, { status: 200 });
  } catch (error) {
    console.log("[NOTIFICATION_SEND]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
