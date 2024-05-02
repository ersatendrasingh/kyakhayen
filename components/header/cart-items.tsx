"use client";

import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";

import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/formatCurrency";
import { CartItem } from "@/types/cart-item";
import { useUserCountry } from "@/context/user-country-context";
import { exchangePrice } from "@/lib/exchangePrice";

interface CartItemProps {
  item: CartItem;
}

const CartItems = ({ item }: CartItemProps) => {
  const [itemPrice, setItemPrice] = useState(item.price);
  const { userCurrency, userCountry } = useUserCountry();

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
    if (!userCountry) return;
    userCountry !== "IN"
      ? handlePriceExchange(item.int_price, userCurrency)
      : handlePriceExchange(item.price, userCurrency);
  }, [userCurrency, userCountry, item.price, item.int_price]);
  const { updateQuantityInCart, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
      <div className="flex-shrink-0 mr-4">
        <div style={{ width: "50px", height: "70px", position: "relative" }}>
          <Image
            src={item.imageUrl || "/"}
            alt={item.title}
            width={80}
            height={80}
          />
        </div>
      </div>
      <div className="flex-grow flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-grow md:mr-4">
          <p className="text-lg font-bold mb-2">
            <Link href={`/course/${item.slug}`}>{item.title}</Link>
          </p>
          <p className="pb-2 text-sm">
            {formatCurrency(itemPrice * item.quantity, userCurrency)}
          </p>
          <div className="flex items-center">
            <button
              onClick={() => updateQuantityInCart(item.id, item.quantity - 1)}
              className="px-2 py-1 rounded-md bg-red-500 text-white text-sm"
            >
              -
            </button>
            <span className="text-lg px-2">{item.quantity}</span>
            <button
              onClick={() => updateQuantityInCart(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-emerald-500 text-white rounded-md text-sm"
            >
              +
            </button>
          </div>
        </div>
        <div className="ml-auto order-first md:order-last">
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-gray-500"
          >
            <IoMdClose />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
