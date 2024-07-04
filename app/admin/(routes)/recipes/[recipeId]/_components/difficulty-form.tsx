"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Pencil, PlusCircleIcon, Signal } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { Recipes } from "@prisma/client";

interface DifficultyFormProps {
  initialData: Recipes;
  recipeId: string;
  options: { label: string; value: string }[];
}

const formSchema = z.object({
  recipeDifficultyId: z.string().min(1),
});

export const DifficultyForm = ({
  initialData,
  recipeId,
  options,
}: DifficultyFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeDifficultyId: initialData?.recipeDifficultyId || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/recipes/${recipeId}`, values);
      toast.success("Recipe difficulty updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe difficulty", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.recipeDifficultyId
  );
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe difficulty
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.recipeDifficultyId ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit difficulty
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Add a difficulty
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.recipeDifficultyId && "italic text-slate-500"
          )}
        >
          <Signal className="w-4 h-4 mr-3 inline" />
          {selectedOption?.label || "No difficulty selected"}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="recipeDifficultyId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select a difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => {
                          return (
                            <SelectItem key={option.label} value={option.value}>
                              {option.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
