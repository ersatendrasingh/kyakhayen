"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import emptyCart from "@/public/assets/images/empty-cart.png";

const EmptyCart = () => {
  return (
    <div className="text-center py-8">
      <div className="px-6 py-10">
        <Image
          src={emptyCart}
          alt="empty-cart"
          className="mx-auto"
          width={250}
        />
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500">
          Start adding courses to your cart to see them here.
        </p>
        <Button className="bg-blue-500 text-white hover:bg-blue-600 text-md font-bold px-4 py-7 rounded-md mb-2 mt-8">
          Go to courses
        </Button>
      </div>
    </div>
  );
};

export default EmptyCart;
