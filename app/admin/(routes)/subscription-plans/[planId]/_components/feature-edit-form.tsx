import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Feature } from "@prisma/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
interface FeatureEditFormProps {
  feature: Feature;
  onCancel: () => void;

  onSave: (updatedFeature: Feature) => void;
}
const FeatureEditForm = ({
  feature,
  onCancel,
  onSave,
}: FeatureEditFormProps) => {
  const [editedFeature, setEditedFeature] = useState(feature);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedFeature((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formSchema = z.object({
    name: z.string().min(1, { message: "Feature Title is required" }),
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/subscription-plans/${feature.planId}/features/${feature.id}`,
        values
      );
      toast.success("Plan feature updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      onSave({ ...feature, ...values });

      router.refresh();
    } catch {
      toast.error("Something went wrong while updating plan feature", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: feature.name,
    },
  });
  const { isSubmitting, isValid } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full px-2 mb-4 md:mb-0">
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
        </div>

        <div className="flex items-center justify-end gap-x-2">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="pt-2"
          >
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FeatureEditForm;
