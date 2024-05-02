"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { RecipeIngredients, Recipes, Units } from "@prisma/client";

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

import { cn } from "@/lib/utils";
import ChapterList from "./ingredients-list";
import IngredientsList from "./ingredients-list";
type RecipeIngredient = RecipeIngredients & {
  unit: Units;
};
interface IngredientsFormProps {
  initialData: Recipes & {
    recipeIngredients: RecipeIngredient[];
  };
  recipeId: string;
  options: { title: string; shortName: string; value: string }[];
}

const formSchema = z.object({
  quantity: z.string().min(1, { message: "Quantity is required" }),
  unitId: z.string().min(1),
  name: z.string().min(1, { message: "Name is required" }),
  notes: z.string().optional(),
});

export const IngredientsForm = ({
  initialData,
  recipeId,
  options,
}: IngredientsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unitId: "",
      notes: "",
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
                        <Select onValueChange={field.onChange}>
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
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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
