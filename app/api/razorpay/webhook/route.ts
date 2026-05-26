import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { render } from "react-email";
import { sendEmail } from "@/lib/mail";
import OrderConfirmationMail from "@/emails/customer-order-confirmation";
import CustomerOrderAdminMail from "@/emails/customer-order-admin-mail";
import { formatDate } from "@/lib/formatDate";
import { getMealPlanQueue } from "@/lib/meal-plan-queue";

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

    let response;

    switch (event) {
      case "payment.captured":
        response = await handlePaymentCaptured(payload);
        break;
      case "payment.failed":
        response = await handlePaymentFailed(payload);
        break;
      default:
        console.log("Unknown event type:", event);
        return NextResponse.json(
          { message: "Unknown event type" },
          { status: 400 }
        );
    }

    return response;
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

const handlePaymentCaptured = async (payload: any) => {
  try {
    const paymentEntity = payload.payment.entity;

    const planId = paymentEntity.notes.planId;

    const orderId = paymentEntity.order_id;

    const order = await db.order.findUnique({
      where: {
        orderId: orderId,
      },
      include: {
        user: {
          include: {
            UserAddress: true,
            UserPlan: true,
          },
        },
        items: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!order || order.paymentStatus === "Paid") {
      console.log("Order not found or already paid");
      return NextResponse.json(
        { message: "Order not found or already paid" },
        { status: 400 }
      );
    }

    const plan = await db.plan.findUnique({ where: { id: planId } });

    if (!plan) {
      console.log("Plan not found");
      return NextResponse.json({ message: "Plan not found" }, { status: 400 });
    }

    // Find if the user has an active plan
    const activeUserPlan = order.user.UserPlan.find((userPlan: any) => {
      const endDate = userPlan.endDate ? new Date(userPlan.endDate) : null;
      return endDate && endDate > new Date();
    });

    if (activeUserPlan) {
      // Update the existing plan with the new plan details and extend the end date
      const newEndDate = activeUserPlan.endDate
        ? new Date(
            new Date(activeUserPlan.endDate).setDate(
              new Date(activeUserPlan.endDate).getDate() +
                (plan.durationDays || 0) -
                1 // Subtract 1 day
            )
          )
        : new Date(); // Fallback to current date if `endDate` is null

      await db.userPlan.update({
        where: { id: activeUserPlan.id },
        data: {
          planId: plan.id,
          endDate: newEndDate,
        },
      });
    } else {
      // Create a new plan assignment if no active plan exists
      await db.userPlan.create({
        data: {
          userId: order.user.id,
          planId: plan.id,
          startDate: new Date(),
          endDate: new Date(
            new Date().setDate(
              new Date().getDate() + (plan.durationDays || 0) - 1 // Subtract 1 day
            )
          ),
        },
      });
    }

    await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "Paid",
      },
    });
    //Call the generate meal plan queue
    const mealPlanQueue = getMealPlanQueue();
    await mealPlanQueue.add("generateMealPlan", { userId: order.user.id });
    await mealPlanQueue.close();

    const customerEmail = order.user.email;
    const customerName = order.user.name;
    const customerPhoneNumber = order.user.phoneNumber;
    const userAddress = order.user.UserAddress[0];

    await sendEmail({
      to: order.user.email as string,
      subject: "Your Kya Khayen order has been successfully placed!",
      html: await render(
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
              durationDays: item.plan.durationDays,
            })),
          },
        })
      ),
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL as string,
      subject: "New order placed on Kya Khayen using Razorpay",
      html: await render(
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
              durationDays: item.plan.durationDays,
            })),
          },
        })
      ),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling captured payment:", error);
    return NextResponse.json("Error handling captured payment", {
      status: 500,
    });
  }
};

const handlePaymentFailed = async (payload: any) => {
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
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
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
      html: await render(
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
              durationDays: item.plan.durationDays,
            })),
          },
        })
      ),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling captured payment:", error);
    return NextResponse.json("Error handling captured payment", {
      status: 500,
    });
  }
};
