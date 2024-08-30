"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Feature, Plan } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import FeaturesList from "./features-list";
//import MethodsList from "./methods-list";

interface FeaturesFormProps {
  initialData: Plan & {
    features: Feature[];
  };
  planId: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Feature Title is required" }),
});

export const FeaturesForm = ({ initialData, planId }: FeaturesFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/subscription-plans/${planId}/features`, values);
      toast.success("Plan feature created successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      form.reset();
      toggleCreate();
      router.refresh();
    } catch {
      toast.error("Something went wrong while creating plan feature", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/subscription-plans/${planId}/features/reorder`, {
        list: updateData,
      });
      toast.success("Plan features reordered successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      router.refresh();
    } catch {
      toast.error("Something went wrong while reordering plan features", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/admin/subscription-plans/${planId}/features/${id}`);
  };

  return (
    <div className="relative mt-6 border rounded-md p-4 bg-slate-100">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-red-700 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Plan Features
        <Button onClick={toggleCreate} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add a feature
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <div className=" mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Feature title"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "mt-2 text-sm",
            !initialData.features.length && "text-slate-500 italic"
          )}
        >
          {!initialData.features.length && "No features yet"}
          <FeaturesList
            onEdit={onEdit}
            onReorder={onReorder}
            planId={planId}
            items={initialData.features || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the features
        </p>
      )}
    </div>
  );
};
