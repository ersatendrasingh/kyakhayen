"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

interface RecipeAllergyFormProps {
  initialData: {
    id: string;
    recipeId: string;
    allergyId: string;
    allergy: {
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
  recipeAllergyId: z.array(recipeSchema).min(1),
});

export const RecipeAllergyForm = ({
  initialData,
  recipeId,
  options,
}: RecipeAllergyFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeAllergyId: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const allergyValues = values.recipeAllergyId.map(
        (allergy) => allergy.value
      );

      await axios.post(`/api/recipes/${recipeId}/allergies`, {
        allergyValues,
      });
      toast.success("Recipe allergies updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe allergies", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe allergies
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.length > 0 ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit allergies
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add a allergies
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.length > 0 ? (
            initialData.map((allergy) => (
              <Badge
                key={allergy.allergy.id}
                variant="default"
                className="mx-1 bg-websecondary text-white"
              >
                {allergy.allergy.title}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-foreground italic">
              No allergies selected
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
              name="recipeAllergyId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      options={options}
                      placeholder="Select allergies"
                      onChange={field.onChange}
                      defaultValues={initialData.map((allergy) => ({
                        value: allergy.allergy.id,
                        label: allergy.allergy.title,
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
