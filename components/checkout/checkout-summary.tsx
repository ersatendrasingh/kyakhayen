"use client";

import CartSummaryItem from "@/components/cart/cart-summary-item";
import { useCart } from "@/context/cart-context";

import { useUserCountry } from "@/context/user-country-context";
import ProductItemInCart from "./product-item-in-cart";

interface CartSummaryProps {
  subTotal: number;
  taxAmount?: number;
  couponDiscount?: number;
  grandTotal: number;
  appliedCoupon?: {
    code: string;
    calculatedDiscount: number;
    discountValue: number;
    discountType: "FIXED_PRODUCT" | "CART_PERCENTAGE";
    applicableProducts?: {
      id: string;
      name: string;
      priceInr: number;
      priceUsd: number;
    }[];
  } | null;
  onRemoveCoupon?: () => void;
}

const CheckoutSummary = ({
  subTotal,
  taxAmount,
  grandTotal,
  appliedCoupon,
  onRemoveCoupon,
}: CartSummaryProps) => {
  const { cartItems } = useCart();
  const { userCountry } = useUserCountry();
  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon(); // Call the parent callback to remove the coupon
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-start">
      <h1 className="text-2xl font-bold mb-4">Cart Summary</h1>
      <div className="flex flex-col w-full">
        {cartItems.map((item) => (
          <ProductItemInCart
            key={item.id}
            title={item.name}
            price={userCountry === "IN" ? item.priceInr! : item.priceUsd!}
            quantity={item.quantity}
          />
        ))}
      </div>
      <div className="flex flex-col w-full">
        <CartSummaryItem title="Subtotal" value={subTotal || 0} />
        {userCountry === "IN" && (
          <CartSummaryItem title="Tax Amount" value={taxAmount || 0} />
        )}
        {appliedCoupon && (
          <>
            <CartSummaryItem
              title="Coupon Code"
              value={appliedCoupon.code}
              titleClassName="font-bold"
              isRemoveButtonVisible
              onRemove={handleRemoveCoupon}
            />
            <CartSummaryItem
              title="Discount"
              value={appliedCoupon.calculatedDiscount || 0}
              isDiscount
              titleClassName="font-bold text-emerald-500"
              valueClassName="text-emerald-500 font-bold"
            />
          </>
        )}
        <CartSummaryItem
          title="Grand Total"
          value={
            appliedCoupon
              ? grandTotal - appliedCoupon?.calculatedDiscount
              : grandTotal || 0
          }
        />
      </div>
    </div>
  );
};

export default CheckoutSummary;
