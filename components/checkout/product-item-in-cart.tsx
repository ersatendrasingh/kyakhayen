"use client";

import { useUserCountry } from "@/context/user-country-context";
import { exchangePrice } from "@/lib/exchangePrice";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProductItemInCartProps {
  title: string;
  price: number;
  quantity: number;
}

const ProductItemInCart = ({
  title,
  price,
  quantity,
}: ProductItemInCartProps) => {
  const [itemPrice, setItemPrice] = useState(price);
  const { userCurrency } = useUserCountry();

  useEffect(() => {
    const handlePriceExchange = async (price: number, userCurrency: string) => {
      try {
        const exchangedValue = await exchangePrice(price, userCurrency);
        setItemPrice(exchangedValue);
      } catch (error) {
        console.error("Error exchanging price:", error);
        setItemPrice(price);
      }
    };

    handlePriceExchange(price, userCurrency);
  }, [userCurrency, price]);
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
        <span>x {quantity}</span>
      </div>
      <div>
        <span
          className={cn(
            "text-gray-600 mr-2",
            title === "Grand Total" ? "font-bold" : ""
          )}
        >
          {formatCurrency(itemPrice * quantity, userCurrency)}
        </span>
      </div>
    </div>
  );
};

export default ProductItemInCart;
