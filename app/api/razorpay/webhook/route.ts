import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/mail";
import OrderConfirmationMail from "@/emails/customer-order-confirmation";
import CustomerOrderAdminMail from "@/emails/customer-order-admin-mail";
import { formatDate } from "@/lib/formatDate";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !body.event) {
      return NextResponse.json("Invalid request body format", { status: 400 });
    }

    const { event, payload } = body;
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    const isValidSignature = validateWebhookSignature(
      JSON.stringify(body),
      razorpaySignature as string,
      process.env.RAZORPAY_WEBHOOK_SECRET as string
    );

    if (!isValidSignature) {
      return NextResponse.json("Invalid webhook signature", { status: 400 });
    }

    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload);
        break;
      default:
        console.log("Unknown event type:", event);
    }

    return NextResponse.json("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

async function handlePaymentCaptured(payload: any): Promise<void> {
  try {
    const paymentEntity = payload.payment.entity;

    const orderId = paymentEntity.order_id;

    const order = await db.order.findUnique({
      where: {
        orderId: orderId,
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
        paymentStatus: "Paid",
      },
    });

    const customerEmail = order.user.email;
    const customerName = order.user.name;
    const customerPhoneNumber = order.user.phoneNumber;
    const userAddress = order.user.UserAddress[0];

    await sendEmail({
      to: order.user.email as string,
      subject: "Your Kya Khayen order has been successfully placed!",
      html: render(
        OrderConfirmationMail({
          subjectLine: "Your Order Has Been Placed Successfully!",
          name: order.user.name as string,
          currency: order.currency as string,
          paymentMethod: "Razorpay",
          paymentStatus: "Paid",
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
              durationMonths: item.plan.durationMonths,
            })),
          },
        })
      ),
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL as string,
      subject: "New order placed on Kya Khayen using Razorpay",
      html: render(
        CustomerOrderAdminMail({
          subjectLine:
            "Someone has placed an order on your Kya Khayen Website. Here are the details:",
          name: customerName as string,
          currency: order.currency as string,
          email: customerEmail as string,
          phoneNumber: customerPhoneNumber as string,
          country: userAddress?.country || "",
          state: userAddress?.state || "",
          city: userAddress?.city || "",
          paymentMethod: "Razorpay",
          paymentStatus: "Paid",
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
              durationMonths: item.plan.durationMonths,
            })),
          },
        })
      ),
    });

    console.log("Payment captured successfully");
  } catch (error) {
    console.error("Error handling captured payment:", error);
  }
}

async function handlePaymentFailed(payload: any): Promise<void> {
  try {
    const paymentEntity = payload.payment.entity;

    const orderId = paymentEntity.order_id;

    const order = await db.order.findUnique({
      where: {
        orderId: orderId,
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
        paymentStatus: "Failed",
      },
    });

    const customerEmail = order.user.email;
    const customerName = order.user.name;
    const customerPhoneNumber = order.user.phoneNumber;
    const userAddress = order.user.UserAddress[0];

    await sendEmail({
      to: order.user.email as string,
      subject: "Order Attempt on Kya Khayen Unsuccessful - Action Required",
      html: render(
        OrderConfirmationMail({
          subjectLine:
            "Order Placement Unsuccessful, Please try again or contact support for assistance.",
          name: order.user.name as string,
          currency: order.currency as string,
          paymentMethod: "Razorpay",
          paymentStatus: "Failed",
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
              durationMonths: item.plan.durationMonths,
            })),
          },
        })
      ),
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL as string,
      subject: "An order has been failed on Vedique using Razorpay",
      html: render(
        CustomerOrderAdminMail({
          subjectLine:
            "An attempt to place an order on your Vedique Website was unsuccessful. Here are the details:",
          name: customerName as string,
          currency: order.currency as string,
          email: customerEmail as string,
          phoneNumber: customerPhoneNumber as string,
          country: userAddress?.country || "",
          state: userAddress?.state || "",
          city: userAddress?.city || "",
          paymentMethod: "Razorpay",
          paymentStatus: "Failed",
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
              durationMonths: item.plan.durationMonths,
            })),
          },
        })
      ),
    });

    console.log("Payment captured successfully");
  } catch (error) {
    console.error("Error handling captured payment:", error);
  }
}
