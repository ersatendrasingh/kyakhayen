"use client";

import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";

import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/formatCurrency";
import { CartItem } from "@/types/cart-item";

import { useEffect, useState } from "react";
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
        // Handle the error here if needed
        setItemPrice(price); // Return the original price in case of error
      }
    };
    if (!userCountry) return;
    userCountry !== "IN"
      ? handlePriceExchange(item.int_price, userCurrency)
      : handlePriceExchange(item.price, userCurrency);
  }, [userCurrency, userCountry, item.price, item.int_price]);

  const { updateQuantityInCart, removeFromCart } = useCart();

  return (
    <>
      <tr key={item.id} className="text-center bg-white">
        <td className="border border-b border-r px-4 py-2 text-center">
          <div className="flex justify-center items-center">
            <Image
              src={item.imageUrl || "/"}
              alt={item.title}
              width={150}
              height={100}
            />
          </div>
        </td>
        <td className="border border-b border-r px-4 py-2 font-bold">
          <Link href={`/course/${item.slug}`}>{item.title}</Link>
        </td>
        <td className="border border-b border-r px-4 py-2">
          {formatCurrency(itemPrice, userCurrency)}
        </td>
        <td className="border border-b border-r px-4 py-2 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center">
            <button
              onClick={() => updateQuantityInCart(item.id, item.quantity - 1)}
              className="px-2 py-1 rounded-md mb-2 md:mr-2 md:mb-0 bg-red-500 text-white"
            >
              -
            </button>
            <span className="text-lg">{item.quantity}</span>
            <button
              onClick={() => updateQuantityInCart(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-emerald-500 text-white rounded-md mt-2 md:ml-2 md:mt-0"
            >
              +
            </button>
          </div>
        </td>
        <td className="border border-b border-r px-4 py-2">
          {formatCurrency(itemPrice * item.quantity, userCurrency)}
        </td>
        <td className="border border-b border-r px-4 py-2">
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-gray-500"
          >
            <IoMdClose />
          </button>
        </td>
      </tr>
    </>
  );
};

export default CartItems;
