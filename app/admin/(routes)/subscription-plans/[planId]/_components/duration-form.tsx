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

import { Plan } from "@prisma/client";

interface DurationFormProps {
  initialData: Plan;
  planId: string;
}

const formSchema = z.object({
  durationDays: z.coerce.number().optional(),
});

export const DurationForm = ({ initialData, planId }: DurationFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationDays: initialData.durationDays || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/subscription-plans/${planId}`, values);
      toast.success("Plan duration updated successfully", {
        duration: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating plan duration", {
        duration: 5000,
      });
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Plan Duration
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.durationDays ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit duration
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set duration
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
              !initialData.durationDays && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Duration in days : </span>
            {initialData.durationDays
              ? initialData.durationDays > 1
                ? initialData.durationDays + " Days"
                : initialData.durationDays + " Day"
              : "No duration set yet"}
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
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Plan Duration</FormLabel>
                      <Input
                        type="number"
                        step={0.01}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your plan duration in days"
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
