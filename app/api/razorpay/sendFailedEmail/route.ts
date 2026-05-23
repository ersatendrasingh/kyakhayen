import { db } from "@/lib/db";
import { NextResponse } from "next/server";

import { render } from "react-email";
import { sendEmail } from "@/lib/mail";
import OrderConfirmationMail from "@/emails/customer-order-confirmation";
import CustomerOrderAdminMail from "@/emails/customer-order-admin-mail";
import { formatDate } from "@/lib/formatDate";

export async function POST(req: Request) {
  try {
    const { orderId, paymentStatus, name, email, phoneNumber } =
      await req.json();

    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          include: {
            UserAddress: true,
          },
        },
        items: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!order) {
      console.log("Order not found");
      return;
    }

    await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus,
      },
    });

    const userAddress = order.user.UserAddress[0];

    await sendEmail({
      to: email as string,
      subject: "Order Attempt on Kya Khayen Unsuccessful - Action Required",
      html: await render(
        OrderConfirmationMail({
          subjectLine:
            "Order Placement Unsuccessful, Please try again or contact support for assistance.",
          name: name as string,
          currency: order.currency as string,
          paymentMethod: "Razorpay",
          paymentStatus: paymentStatus,
          orderDetails: {
            orderId: order.orderId as string,
            orderDate: formatDate(order.createdAt),
            subTotal: order.subTotal as number,
            totalTax: order.taxTotal as number,
            totalAmount: order.totalAmount as number,
            coupon: order.coupon || "",
            discount: order.discount || 0,
            items: order.items.map((item: any) => ({
              name: item.plan.name,
              quantity: item.quantity,
              priceInr: item.plan.priceInr,
              priceUsd: item.plan.priceUsd,
              durationDays: item.plan.durationDays,
            })),
          },
        })
      ),
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL as string,
      subject: "An order has been failed on Kya Khayen using Razorpay",
      html: await render(
        CustomerOrderAdminMail({
          subjectLine:
            "An attempt to place an order on your Kya Khayen Website was unsuccessful. Here are the details:",
          name: name as string,
          currency: order.currency as string,
          email: email as string,
          phoneNumber: phoneNumber as string,
          country: userAddress?.country || "",
          state: userAddress?.state || "",
          city: userAddress?.city || "",
          paymentMethod: "Razorpay",
          paymentStatus: paymentStatus,
          orderDetails: {
            orderId: order.orderId as string,
            orderDate: formatDate(order.createdAt),
            subTotal: order.subTotal as number,
            totalTax: order.taxTotal as number,
            totalAmount: order.totalAmount as number,
            coupon: order.coupon || "",
            discount: order.discount || 0,
            items: order.items.map((item: any) => ({
              name: item.plan.name,
              quantity: item.quantity,
              priceInr: item.plan.priceInr,
              priceUsd: item.plan.priceUsd,
              durationDays: item.plan.durationDays,
            })),
          },
        })
      ),
    });

    return NextResponse.json("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("[FAILED_EMAIL_SENT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
