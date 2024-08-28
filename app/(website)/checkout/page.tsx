"use client";

import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { CircleDashed } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import CheckoutForm from "@/components/checkout/checkout-form";
import Container from "@/components/container";
import PageTitle from "@/components/sections/page-title";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useUserCountry } from "@/context/user-country-context";
import { Form } from "@/components/ui/form";
import { checkoutSchema } from "@/schemas";
import { useCurrentUser } from "@/hooks/use-current-user";
import EmptyCart from "@/components/cart/empty-cart";
import { getFormattedDateTime } from "@/lib/formateOrderDate";

const CheckoutPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>("COD");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const router = useRouter();
  const user = useCurrentUser();
  const { cartItems, emptyCart } = useCart();
  const { userCurrency, userCountry } = useUserCountry();

  if (cartItems?.length === 0) return <EmptyCart />;

  return (
    <div className="w-full bg-slate-100 pb-20">
      <PageTitle title="Checkout" className="py-2" />
      <Container>
        <div className="w-full flex ">
          <CheckoutForm />
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
