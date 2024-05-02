"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/cart-item";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CartDetails from "@/components/header/cart-details";
import { useCart } from "@/context/cart-context";

interface AddToCartProps {
  item: CartItem;
}

const AddToCart = ({ item }: AddToCartProps) => {
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const handleAddToCart = () => {
    setIsProcessing(true);
    addToCart(item);
    setIsProcessing(false);
    setIsSheetOpen(true);
  };
  return (
    <>
      <Button
        className="bg-blue-500 text-white hover:bg-blue-600 text-md font-bold px-4 py-7 rounded-md mb-2 w-full"
        onClick={handleAddToCart}
        disabled={isProcessing}
      >
        {isProcessing ? "Adding to Cart..." : "Add to Cart"}
      </Button>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right">
          <h2 className="text-2xl font-bold mb-5 border-b-2 pb-2">
            Your Shopping Cart
          </h2>
          <CartDetails />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AddToCart;
