"use client";

import Link from "next/link";

import CartItems from "@/components/header/cart-items";
import EmptyCart from "@/components/cart/empty-cart";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

const CartDetails = () => {
  const { cartItems } = useCart();
  return (
    <div className="flex flex-col h-full">
      {cartItems && cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {cartItems.map((item) => (
            <CartItems key={item.id} item={item} />
          ))}
          <div className="mb-24 mt-auto">
            {cartItems.length > 0 && (
              <>
                <Link href="/cart">
                  <Button className="bg-sky-500 text-white hover:bg-sky-600 text-md font-bold px-4 py-4 rounded-md mb-2 w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button className="bg-green-500 text-white hover:bg-green-600 text-md font-bold px-4 py-4 rounded-md mb-2 w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartDetails;
