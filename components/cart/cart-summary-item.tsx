"use client";

import { useUserCountry } from "@/context/user-country-context";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface CartSummaryItemProps {
  title: string;
  value: number;
}

const CartSummaryItem = ({ title, value }: CartSummaryItemProps) => {
  const { userCurrency } = useUserCountry();
  return (
    <div
      className={cn(
        "flex mx-2 my-4   items-center justify-between",
        title === "Grand Total" ? "" : "border-b-2 pb-2 border-gray-100"
      )}
    >
      <div>
        <span
          className={cn(
            "text-gray-600 mr-2",
            title === "Grand Total" ? "font-bold" : ""
          )}
        >
          {title}
        </span>
      </div>
      <div>
        <span
          className={cn(
            "text-gray-600 mr-2",
            title === "Grand Total" ? "font-bold" : ""
          )}
        >
          {formatCurrency(value, userCurrency)}
        </span>
      </div>
    </div>
  );
};

export default CartSummaryItem;
