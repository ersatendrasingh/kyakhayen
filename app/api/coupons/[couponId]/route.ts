import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function DELETE(req: Request, props: { params: Promise<{ couponId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { couponId } = params;

    const coupon = await db.coupon.findUnique({
      where: {
        id: couponId,
      },
    });

    if (!coupon) {
      return NextResponse.json("Coupon not found", { status: 404 });
    }

    const deletedCoupon = await db.coupon.delete({
      where: {
        id: couponId,
      },
    });
    return NextResponse.json(deletedCoupon, { status: 200 });
  } catch (error) {
    console.log("[COUPON_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ couponId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { couponId } = params;
    const { products, ...values } = await req.json();
    const productsArray = Array.isArray(products) ? products : [];

    const updatedCoupon = await db.coupon.update({
      where: {
        id: couponId,
      },
      data: {
        ...values,
      },
      include: {
        PlanOnCoupon: true, // Include associated products
      },
    });
    // Get current product IDs associated with the coupon
    const existingProductIds = updatedCoupon.PlanOnCoupon.map(
      (pc) => pc.planId
    );

    // Determine products to add and remove based on request
    const productsToAdd = productsArray.filter(
      (planId) => !existingProductIds.includes(planId)
    );
    const productsToRemove = existingProductIds.filter(
      (planId) => !productsArray.includes(planId)
    );

    // Remove products from association if needed
    if (productsToRemove.length > 0) {
      await db.planOnCoupon.deleteMany({
        where: {
          couponId,
          planId: { in: productsToRemove },
        },
      });
    }

    // Add products to association if needed
    if (productsToAdd.length > 0) {
      const newProductAssociations = productsToAdd.map((planId) => ({
        couponId,
        planId,
      }));
      await db.planOnCoupon.createMany({
        data: newProductAssociations,
      });
    }

    // Fetch updated coupon with latest associations
    const updatedCouponWithProducts = await db.coupon.findUnique({
      where: { id: couponId },
      include: { PlanOnCoupon: true },
    });

    return NextResponse.json(updatedCouponWithProducts, { status: 200 });
  } catch (error) {
    console.log("[COUPON_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
