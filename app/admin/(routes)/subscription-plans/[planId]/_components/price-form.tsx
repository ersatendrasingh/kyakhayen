"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, PlusCircleIcon } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";

import { Plan } from "@prisma/client";

interface PriceFormProps {
  initialData: Plan;
  planId: string;
}

const formSchema = z.object({
  priceInr: z.coerce.number().optional(),
  priceUsd: z.coerce.number().optional(),
});

export const PriceForm = ({ initialData, planId }: PriceFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceInr: initialData.priceInr || undefined,
      priceUsd: initialData.priceUsd || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/subscription-plans/${planId}`, values);
      toast.success("Plan prices updated successfully", {
        duration: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating plan prices", {
        duration: 5000,
      });
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Plan prices
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.priceInr || initialData.priceUsd ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit prices
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set prices
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.priceInr && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Indian price : </span>
            {initialData.priceInr
              ? formatCurrency(initialData.priceInr, "INR")
              : "No Indian price set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.priceUsd && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">International price : </span>
            {initialData.priceUsd
              ? formatCurrency(initialData.priceUsd, "USD")
              : "No international price set yet"}
          </p>
        </>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="priceInr"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Indian Price</FormLabel>
                      <Input
                        type="number"
                        step={0.01}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your plan price for Indian customers"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceUsd"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>International Price</FormLabel>
                      <Input
                        type="number"
                        step={0.01}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your plan price for international customers"
                      />
                    </>
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
