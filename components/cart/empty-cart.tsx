"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import emptyCart from "@/public/assets/images/empty-cart-2.png";

const EmptyCart = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
      <div className="text-center max-w-md">
        <Image
          src={emptyCart}
          alt="empty-cart"
          className="mx-auto"
          width={250}
          height={250}
        />
        <h2 className="text-3xl font-bold mb-4 mt-6">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">
          Explore our subscription plans to find the best option for you.
        </p>
        <Link href="/subscription-plans">
          <Button className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 text-md font-bold px-6 py-3 rounded-md">
            Join Kya Khayen?
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyCart;
