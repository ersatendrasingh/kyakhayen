import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    const existingUserAddress = await db.userAddress.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (existingUserAddress) {
      await db.userAddress.update({
        where: {
          id: existingUserAddress.id,
        },
        data: {
          address: body.address,
          city: body.city,
          country: body.country,
          state: body.state,
          zip: body.zip,
        },
      });
    } else {
      await db.userAddress.create({
        data: {
          address: body.address,
          city: body.city,
          country: body.country,
          state: body.state,
          zip: body.zip,
          userId: user.id as string,
        },
      });
    }

    const order = await db.order.create({
      data: {
        userId: user.id as string,
        totalAmount: parseFloat(body.totalPrice.toFixed(2)),
        currency: body.currency,
        subTotal: parseFloat(body.subTotal.toFixed(2)),
        taxTotal: parseFloat(body.calculateTotalTax.toFixed(2)),
        coupon: body.couponCode,
        discount: body.discount ? parseFloat(body.discount.toFixed(2)) : null,
        paymentMethod: body.paymentMethod,
      },
    });

    await db.item.createMany({
      data: body.items.map((item: any) => ({
        orderId: order.id,
        itemName: item.title,
        planId: item.planId,
        priceInr: item.priceInr,
        priceUsd: item.priceUsd,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.log("[CHECKOUT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
