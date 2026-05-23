import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        "Payment gateway is not configured.",
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const userId = await db.user.findUnique({
      where: {
        email: user.email!,
      },
      select: {
        id: true,
      },
    });

    const body = await req.json();

    const {
      amount,
      currency,
      orderId,
      name,
      email,
      contact,
      address,
      city,
      state,
      country,
      pincode,
      planId,
    } = body;

    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: randomUUID(),
      payment_capture: 1,
      notes: {
        name,
        email,
        contact,
        address,
        city,
        state,
        country,
        pincode,
        planId,
      },
    };

    const order = await razorpay.orders.create(options);
    await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderId: order.id,
      },
    });
    return NextResponse.json(
      { id: order.id, currency: order.currency, amount: order.amount },
      { status: 200 }
    );
  } catch (error) {
    console.error("RAZORPAY_HANDLE ERROR", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
