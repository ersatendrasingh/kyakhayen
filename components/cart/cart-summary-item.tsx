"use client";

import { useUserCountry } from "@/context/user-country-context";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface CartSummaryItemProps {
  title: string;
  value: number | string;
  titleClassName?: string;
  valueClassName?: string;
  isRemoveButtonVisible?: boolean;
  onRemove?: () => void;
}

const CartSummaryItem = ({
  title,
  value,
  titleClassName,
  valueClassName,
  isRemoveButtonVisible,
  onRemove,
}: CartSummaryItemProps) => {
  const { userCurrency } = useUserCountry();

  const displayValue =
    typeof value === "number" ? formatCurrency(value, userCurrency) : value;

  const handleCouponRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div
      className={cn(
        "flex mx-2 my-4 items-center justify-between",
        title === "Grand Total" ? "" : "border-b-2 pb-2 border-gray-100"
      )}
    >
      <div>
        <span
          className={cn(
            "text-gray-600 mr-2",
            title === "Grand Total" ? "font-bold" : "",
            titleClassName
          )}
        >
          {title}
        </span>
      </div>
      <div>
        <span
          className={cn(
            "text-gray-600 mr-2",
            title === "Grand Total" ? "font-bold" : "",
            valueClassName
          )}
        >
          {displayValue}
        </span>
        <p className="text-center">
          {isRemoveButtonVisible && (
            <button
              className="text-red-500 hover:text-red-700"
              onClick={handleCouponRemove}
            >
              - Remove
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default CartSummaryItem;
