"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation"; // Corrected import
import { toast } from "react-toastify";
import { Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Coupon, PlanOnCoupon } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface CouponProductFormProps {
  initialData: Coupon & { PlanOnCoupon: PlanOnCoupon[] };
  couponId: string;
  productOptions: { label: string; value: string }[];
}

const productSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const formSchema = z.object({
  products: z.array(productSchema),
});

export const CouponProductForm = ({
  initialData,
  couponId,
  productOptions,
}: CouponProductFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/coupons/${couponId}`, {
        products: values.products.map((p) => p.value),
      });
      toast.success("Coupon products updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh(); // Use reload instead of refresh for Next.js router
    } catch (error) {
      console.error("Error updating coupon products:", error);
      toast.error("Something went wrong while updating coupon products", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const selectedOptions = productOptions.filter((option) =>
    initialData.PlanOnCoupon.some((product) => product.planId === option.value)
  );

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Coupon Plans
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.PlanOnCoupon.length ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit plans
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add plan
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="mt-2 space-y-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge key={option.value} className="bg-emerald-500 mr-2">
                {option.label}
              </Badge>
            ))
          ) : (
            <p className="text-sm italic text-slate-500">
              No plan selected. If no plan are selected, then the coupon will
              apply to all plans.
            </p>
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      options={productOptions}
                      placeholder="Select Plans"
                      onChange={field.onChange}
                      defaultValues={productOptions.filter((option) =>
                        initialData.PlanOnCoupon.some(
                          (product) => product.planId === option.value
                        )
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2 bg-webprimary hover:bg-webprimary/90"
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
