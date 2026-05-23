"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaCloudSunRain } from "react-icons/fa";
import { Pencil, PlusCircleIcon, Signal } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { cn } from "@/lib/utils";

import { Cuisines, RecipeCuisines, Recipes } from "@prisma/client";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

interface CuisinesFormProps {
  initialData: {
    id: string;
    recipeId: string;
    cuisineId: string;
    cuisine: {
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
  recipeCuisineId: z.array(recipeSchema).min(1),
});

export const CuisinesForm = ({
  initialData,
  recipeId,
  options,
}: CuisinesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeCuisineId: [],
    },
  });
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const cuisineValues = values.recipeCuisineId.map(
        (cuisine) => cuisine.value
      );

      await axios.post(`/api/recipes/${recipeId}/cuisines`, { cuisineValues });
      toast.success("Recipe cuisines updated successfully", {
        duration: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe cuisines", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe cuisines
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.length > 0 ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit cuisines
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add a cuisine
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.length > 0 ? (
            initialData.map((cuisine) => (
              <Badge
                key={cuisine.cuisine.id}
                variant="default"
                className="mx-1 bg-websecondary text-white"
              >
                {cuisine.cuisine.title}
              </Badge>
            ))
          ) : (
            <span>No cuisines selected</span>
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
              name="recipeCuisineId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      options={options}
                      placeholder="Select cuisines"
                      onChange={field.onChange}
                      defaultValues={initialData.map((cuisine) => ({
                        value: cuisine.cuisine.id,
                        label: cuisine.cuisine.title,
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
