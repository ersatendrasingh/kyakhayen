"use client";

import CartSummaryItem from "@/components/cart/cart-summary-item";
import { useUserCountry } from "@/context/user-country-context";

interface CartSummaryProps {
  subTotal: number;
  taxAmount?: number;
  couponDiscount?: number;
  grandTotal: number;
}

const CartSummary = ({
  subTotal,
  taxAmount,
  couponDiscount,
  grandTotal,
}: CartSummaryProps) => {
  const { userCountry } = useUserCountry();
  return (
    <div className="w-full flex flex-col items-start justify-start">
      <h1 className="text-2xl font-bold mb-4">Cart Summary</h1>
      <div className="flex flex-col w-full">
        <CartSummaryItem title="Subtotal" value={subTotal || 0} />
        {userCountry === "IN" && (
          <CartSummaryItem title="Tax Amount" value={taxAmount || 0} />
        )}

        {/* <CartSummaryItem title="Coupon Discount" value={couponDiscount} /> */}
        <CartSummaryItem title="Grand Total" value={grandTotal || 0} />
      </div>
    </div>
  );
};

export default CartSummary;
