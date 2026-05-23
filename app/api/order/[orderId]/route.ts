import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  try {
    const { orderId } = params;

    const order = await db.order.findUnique({
      where: {
        orderId,
      },
      include: {
        items: {
          include: {
            plan: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json("Order not found", { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.log("[ORDER_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
