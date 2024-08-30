"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Coupon } from "@prisma/client";

interface CouponAmountFormProps {
  initialData: Coupon;
  couponId: string;
}

const formSchema = z.object({
  discountValue: z.coerce
    .number()
    .min(0, { message: "Discount value must be positive" }),
});

export const CouponAmountForm = ({
  initialData,
  couponId,
}: CouponAmountFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountValue: initialData.discountValue || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/coupons/${couponId}`, values);
      toast.success("Coupon amount updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating coupon amount", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Coupon Amount
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="w-6 h-6 pr-2" />
              Edit amount
            </>
          )}
        </Button>
      </div>
      {!initialData.discountValue && (
        <p className="text-sm mt-2 text-muted-foreground italic">
          No coupn amount set yet
        </p>
      )}
      {!isEditing && initialData.discountValue && (
        <p className="text-sm mt-2">
          {initialData.discountType === "CART_PERCENTAGE"
            ? `${initialData.discountValue} %`
            : initialData.discountValue}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="Enter discount amount"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2 bg-webprimary"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
