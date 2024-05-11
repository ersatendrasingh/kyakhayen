import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RecipeHealthBenefits } from "@prisma/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
interface BenefitEditFormProps {
  benefit: RecipeHealthBenefits;
  onCancel: () => void;

  onSave: (updatedBenefit: RecipeHealthBenefits) => void;
}
const BenefitEditForm = ({
  benefit,
  onCancel,
  onSave,
}: BenefitEditFormProps) => {
  const [editedBenefit, setEditedBenefit] = useState(benefit);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedBenefit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formSchema = z.object({
    title: z.string().min(1, { message: "Benefit Title is required" }),
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/recipes/${benefit.recipeId}/health-benefits/${benefit.id}`,
        values
      );
      toast.success("Recipe Health Benefit updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      onSave({ ...benefit, ...values });

      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe benefit", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: benefit.title,
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Benefit title"
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

export default BenefitEditForm;
