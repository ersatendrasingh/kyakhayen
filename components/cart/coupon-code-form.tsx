"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

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
const CouponCodeForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof couponSchema>) => {
    try {
      const response = await axios.post("/api/coupons/apply", values);
    } catch {
      console.log("Something went wrong");
    }
  };
  return (
    <div className="w-full flex flex-col items-start justify-start">
      <h1 className="text-2xl font-bold">Discount Coupon Code</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-8 w-full"
        >
          <div className="flex items-center w-full gap-x-4">
            <FormField
              control={form.control}
              name="couponCode"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl className="w-full">
                    <Input
                      disabled={isSubmitting}
                      placeholder="Coupon Code"
                      {...field}
                      className="w-full text-lg font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500"
            >
              Apply
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CouponCodeForm;
