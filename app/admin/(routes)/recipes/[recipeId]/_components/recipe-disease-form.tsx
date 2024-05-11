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

interface RecipeDiseaseFormProps {
  initialData: {
    id: string;
    recipeId: string;
    diseaseId: string;
    disease: {
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
  recipeDiseaseId: z.array(recipeSchema).min(1),
});

export const RecipeDiseaseForm = ({
  initialData,
  recipeId,
  options,
}: RecipeDiseaseFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeDiseaseId: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const diseaseValues = values.recipeDiseaseId.map(
        (disease) => disease.value
      );

      await axios.post(`/api/recipes/${recipeId}/diseases`, {
        diseaseValues,
      });
      toast.success("Recipe diseases updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe diseases", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe Disease
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.length > 0 ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit disease
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add a disease
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.length > 0 ? (
            initialData.map((disease) => (
              <Badge
                key={disease.disease.id}
                variant="default"
                className="mx-1 bg-websecondary text-white"
              >
                {disease.disease.title}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-foreground italic">
              No disease selected
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
              name="recipeDiseaseId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      options={options}
                      placeholder="Select disease"
                      onChange={field.onChange}
                      defaultValues={initialData.map((disease) => ({
                        value: disease.disease.id,
                        label: disease.disease.title,
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
