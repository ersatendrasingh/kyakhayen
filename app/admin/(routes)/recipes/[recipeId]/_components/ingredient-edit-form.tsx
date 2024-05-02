import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RecipeIngredients } from "@prisma/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
interface IngredientEditFormProps {
  ingredient: RecipeIngredients;
  onCancel: () => void;
  options: { title: string; shortName: string; value: string }[];
  onSave: (updatedIngredient: RecipeIngredients) => void;
}
const IngredientEditForm = ({
  ingredient,
  onCancel,
  onSave,
  options,
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
    quantity: z.string().min(1, { message: "Quantity is required" }),
    unitId: z.string().min(1),
    name: z.string().min(1, { message: "Name is required" }),
    notes: z.string().optional(),
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
      name: ingredient.name,
      quantity: ingredient.quantity.toString(),
      unitId: ingredient.unitId.toString(),
      notes: ingredient.notes || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/6 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Qty"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/6 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={form.getValues("unitId")}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.length > 0 && (
                          <SelectItem value="placeholder" disabled>
                            Unit
                          </SelectItem>
                        )}
                        {options.map((option) => {
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              {`${option.title} (${option.shortName})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Ingredient name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Notes"
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
