import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { db } from "@/lib/db"; // Your database setup

export async function POST(req: NextRequest) {
  try {
    const { notification } = await req.json();

    // Fetch all users from the database
    const allUsers = await db.user.findMany();

    // Array to store promises of notifications
    const notificationPromises = allUsers.map(async (user) => {
      if (!user.firebaseToken) {
        console.log(`User ${user.email} has no Firebase token. Skipping.`);
        return { status: "User has no Firebase token. Skipping." };
      }

      // Construct the message payload for Firebase Cloud Messaging
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.image,
        },
        data: {
          url: notification.url,
        },
        token: user.firebaseToken,
      };

      try {
        // Send the notification using Firebase Admin SDK
        const response = await admin.messaging().send(message);
        console.log(`Notification sent successfully to ${user.email}`);
        return { success: true, response };
      } catch (error: any) {
        console.error(`Error sending notification to ${user.email}`, error);
        return { success: false, error: error.message };
      }
    });

    // Wait for all notifications to be sent
    const results = await Promise.all(notificationPromises);

    // Respond with the results of the notifications
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("[SEND_NOTIFICATIONS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
