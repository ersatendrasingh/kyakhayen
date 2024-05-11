"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

import { Loader2, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import {
  Ingredients,
  IngredientsForm as IngredientsFormType,
  RecipeIngredients,
  Recipes,
  Units,
} from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import IngredientsList from "./ingredients-list";

type RecipeIngredient = RecipeIngredients & {
  unit: Units;
  ingredientForm: IngredientsFormType;
  ingredient: Ingredients;
};
interface IngredientsFormProps {
  initialData: Recipes & {
    recipeIngredients: RecipeIngredient[];
  };
  recipeId: string;
  options: { label: string; value: string }[];
  ingredients: {
    value: string;
    label: string;
  }[];
  forms: {
    value: string;
    label: string;
  }[];
}

const formSchema = z.object({
  quantity: z.coerce.number(),
  unitId: z.string().min(1),
  ingredientId: z.string().min(1),
  formId: z.string().min(1),
});

export const IngredientsForm = ({
  initialData,
  recipeId,
  options,
  ingredients,
  forms,
}: IngredientsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredientId: "",
      unitId: "",
      formId: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/recipes/${recipeId}/ingredients`, values);
      toast.success("Recipe ingredient created successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      form.reset();
      toggleCreate();
      router.refresh();
    } catch {
      toast.error("Something went wrong while creating recipe ingredient", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/recipes/${recipeId}/ingredients/reorder`, {
        list: updateData,
      });
      toast.success("Recipe ingredients reordered successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      router.refresh();
    } catch {
      toast.error("Something went wrong while reordering recipe ingredients", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/admin/recipes/${recipeId}/ingredients/${id}`);
  };

  const selectOptions = ingredients.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  return (
    <div className="relative mt-6 border rounded-md p-4 bg-slate-100">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-700 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Recipe Ingredients
        <Button onClick={toggleCreate} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add a ingredients
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
            <div className="flex flex-wrap -mx-2 mb-4">
              <div className="w-full px-2 mb-4 md:mb-0">
                <FormField
                  control={form.control}
                  name="ingredientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          options={selectOptions}
                          value={ingredients.find(
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
            !initialData.recipeIngredients.length && "text-slate-500 italic"
          )}
        >
          {!initialData.recipeIngredients.length && "No ingredients yet"}
          <IngredientsList
            onEdit={onEdit}
            onReorder={onReorder}
            recipeId={recipeId}
            items={initialData.recipeIngredients || []}
            options={options}
            ingredientsData={ingredients}
            forms={forms}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the ingredients
        </p>
      )}
    </div>
  );
};
