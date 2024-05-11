import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RecipeIngredients } from "@prisma/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
interface IngredientEditFormProps {
  ingredient: RecipeIngredients;
  onCancel: () => void;
  options: { label: string; value: string }[];
  ingredientsData: {
    value: string;
    label: string;
  }[];
  forms: {
    value: string;
    label: string;
  }[];
  onSave: (updatedIngredient: RecipeIngredients) => void;
}
const IngredientEditForm = ({
  ingredient,
  onCancel,
  onSave,
  options,
  ingredientsData,
  forms,
}: IngredientEditFormProps) => {
  const [editedIngredient, setEditedIngredient] = useState(ingredient);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedIngredient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formSchema = z.object({
    quantity: z.coerce.number(),
    unitId: z.string().min(1),
    ingredientId: z.string().min(1),
    formId: z.string().min(1),
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/recipes/${ingredient.recipeId}/ingredients/${ingredient.id}`,
        values
      );
      toast.success("Recipe ingredient updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      onSave({ ...ingredient, ...values });

      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe ingredient", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredientId: ingredient.ingredientId.toString(),
      quantity: ingredient.quantity,
      unitId: ingredient.unitId.toString(),
      formId: ingredient.formId.toString(),
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
              name="ingredientId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      options={ingredientsData}
                      value={ingredientsData.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                      }}
                      placeholder="Select Ingredient"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/5 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.01}
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Qty"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-2/5 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      options={options}
                      value={options.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                      }}
                      placeholder="Select Unit"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-full md:w-2/5 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="formId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      options={forms}
                      value={forms.find(
                        (formData) => formData.value === field.value
                      )}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                      }}
                      placeholder="Select Form"
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

export default IngredientEditForm;
