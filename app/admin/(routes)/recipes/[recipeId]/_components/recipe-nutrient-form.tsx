"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCloudSunRain } from "react-icons/fa";
import { Pencil, PlusCircleIcon, Signal } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { cn } from "@/lib/utils";

import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

interface RecipeNutrientFormProps {
  initialData: {
    id: string;
    recipeId: string;
    nutrientId: string;
    nutrient: {
      id: string;
      title: string;
      slug: string;
      imageUrl: string | null;
    };
  }[];

  recipeId: string;
  options: { label: string; value: string }[];
}

const recipeSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const formSchema = z.object({
  recipeNutrientId: z.array(recipeSchema).min(1),
});

export const RecipeNutrientForm = ({
  initialData,
  recipeId,
  options,
}: RecipeNutrientFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeNutrientId: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const nutrientValues = values.recipeNutrientId.map(
        (nutrient) => nutrient.value
      );

      await axios.post(`/api/recipes/${recipeId}/nutrients`, {
        nutrientValues,
      });
      toast.success("Recipe nutrient updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe nutrient", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe nutrients
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.length > 0 ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit nutrient
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add a nutrient
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.length > 0 ? (
            initialData.map((nutrient) => (
              <Badge
                key={nutrient.nutrient.id}
                variant="default"
                className="mx-1 bg-websecondary text-white"
              >
                {nutrient.nutrient.title}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-foreground italic">
              No nutrient selected
            </span>
          )}
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
              name="recipeNutrientId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      options={options}
                      placeholder="Select nutrient"
                      onChange={field.onChange}
                      defaultValues={initialData.map((nutrient) => ({
                        value: nutrient.nutrient.id,
                        label: nutrient.nutrient.title,
                      }))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2"
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
