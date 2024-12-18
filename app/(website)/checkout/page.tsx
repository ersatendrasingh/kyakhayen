"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CheckoutForm from "@/components/checkout/checkout-form";
import Container from "@/components/container";
import PageTitle from "@/components/sections/page-title";

import { useCart } from "@/context/cart-context";
import EmptyCart from "@/components/cart/empty-cart";

const CheckoutPage = () => {
  const router = useRouter();
  const { cartItems } = useCart();
  if (cartItems?.length === 0) {
    useEffect(() => {
      //router.push("/subscription-plans");
    }, [router, cartItems?.length]);

    return <EmptyCart />;
  }

  return (
    <div className="w-full bg-slate-100 pb-20">
      <PageTitle title="Checkout" />
      <Container>
        <div className="w-full flex">
          <CheckoutForm />
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
