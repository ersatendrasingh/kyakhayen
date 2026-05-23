"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { couponSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CartItem } from "@/types/cart-item";
import { Loader2 } from "lucide-react";

interface CouponCodeFormProps {
  onApplyCoupon: (
    code: string,
    calculatedDiscount: number,
    discountValue: number,
    discountType: "FIXED_PRODUCT" | "CART_PERCENTAGE",
    applicableProducts?: {
      id: string;
      name: string;
      priceInr: number;
      priceUsd: number;
    }[]
  ) => void;
  cartItems: CartItem[];
}

const CouponCodeForm = ({ onApplyCoupon, cartItems }: CouponCodeFormProps) => {
  const router = useRouter();
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof couponSchema>) => {
    try {
      const response = await axios.post("/api/coupons/apply", {
        ...values,
        cartItems,
      });
      setCouponStatus("Coupon applied successfully!");
      setIsSuccess(true);
      onApplyCoupon(
        response.data.code,
        response.data.calculatedDiscount,
        response.data.discountValue,
        response.data.discountType,
        response.data.applicableProducts
      ); // Pass the coupon data to the parent component or a state management
    } catch (error) {
      setIsSuccess(false);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || "Something went wrong";
        toast.error(errorMessage, {
          duration: 5000,
        });
        setCouponStatus(errorMessage);
      } else {
        setCouponStatus("Something went wrong");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-start relative">
      {isSubmitting && (
        <div className="absolute h-full w-full  top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-700 animate-spin" />
        </div>
      )}
      <h1 className="text-2xl font-bold">Discount Coupon Code</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-8 w-full"
        >
          <div className="flex items-center w-full gap-x-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormControl className="w-full">
                    <Input
                      disabled={isSubmitting}
                      placeholder="Coupon Code"
                      {...field}
                      className="w-full text-lg font-medium"
                    />
                  </FormControl>
                  <FormMessage
                    className={isSuccess ? "text-green-500" : "text-red-500"}
                  >
                    {couponStatus}
                  </FormMessage>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full md:w-[200px] flex bg-websecondary hover:bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-4 rounded-md"
                  >
                    Apply
                  </Button>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CouponCodeForm;
