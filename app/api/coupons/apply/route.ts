import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CartItem } from "@/types/cart-item";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { code, cartItems } = await req.json();
    const coupon = await db.coupon.findUnique({
      where: { code },
      include: { ProductOnCoupon: true },
    });

    if (!coupon) {
      return NextResponse.json("Invalid coupon code", { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json("Coupon is not active", { status: 400 });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return NextResponse.json("Coupon is expired", { status: 400 });
    }

    // Check if the coupon is applicable to the cart items
    let isApplicable = false;
    let discount = 0;
    if (coupon.ProductOnCoupon.length === 0) {
      // If no products are associated with the coupon, it is applicable to all products
      isApplicable = true;
    } else {
      // If there are associated products, check if any of the cart items match
      const applicableProductIds = coupon.ProductOnCoupon.map(
        (poc) => poc.productId
      );
      const cartProductIds = cartItems.map((item: CartItem) => item.id);

      isApplicable = cartProductIds.some((id: string) =>
        applicableProductIds.includes(id)
      );
    }

    if (!isApplicable) {
      return NextResponse.json("Coupon not applicable to cart items", {
        status: 400,
      });
    }

    // Calculate discount based on coupon type
    if (coupon.discountType === "PERCENTAGE") {
      const applicableItems = cartItems.filter((item: CartItem) =>
        coupon.ProductOnCoupon.some((poc) => poc.productId === item.id)
      );
      const total =
        coupon.ProductOnCoupon.length === 0
          ? cartItems.reduce(
              (sum: number, item: CartItem) => sum + item.price * item.quantity,
              0
            )
          : applicableItems.reduce(
              (sum: number, item: CartItem) => sum + item.price * item.quantity,
              0
            );

      discount = (total * coupon.discountValue!) / 100;
    } else if (coupon.discountType === "FIXED_PRODUCT") {
      const applicableItems = cartItems.filter((item: CartItem) =>
        coupon.ProductOnCoupon.some((poc) => poc.productId === item.id)
      );
      discount =
        coupon.ProductOnCoupon.length === 0
          ? cartItems.reduce(
              (sum: number, item: CartItem) =>
                sum + coupon.discountValue! / cartItems.length,
              0
            )
          : applicableItems.reduce(
              (sum: number, item: CartItem) =>
                sum + coupon.discountValue! / applicableItems.length,
              0
            );
    } else if (coupon.discountType === "CART_PERCENTAGE") {
      const applicableItems = cartItems.filter((item: CartItem) =>
        coupon.ProductOnCoupon.some((poc) => poc.productId === item.id)
      );
      const total =
        coupon.ProductOnCoupon.length === 0
          ? cartItems.reduce(
              (sum: number, item: CartItem) => sum + item.price * item.quantity,
              0
            )
          : applicableItems.reduce(
              (sum: number, item: CartItem) => sum + item.price * item.quantity,
              0
            );
      discount = (total * coupon.discountValue!) / 100;
    }
    // Apply the coupon to the user by creating an entry in UserCoupon table
    await db.userCoupon.create({
      data: {
        userId: user.id,
        couponId: coupon.id,
      },
    });

    return NextResponse.json(
      {
        code: coupon.code,
        calculatedDiscount: discount,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        applicableProducts:
          coupon.ProductOnCoupon.length === 0
            ? cartItems
            : cartItems.filter((item: CartItem) =>
                coupon.ProductOnCoupon.some((poc) => poc.productId === item.id)
              ),
      },
      { status: 200 }
    ); // Return applied coupon and discount
  } catch (error) {
    console.error("[COUPON_APPLY]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
