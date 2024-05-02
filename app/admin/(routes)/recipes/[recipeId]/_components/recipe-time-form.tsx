"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AlarmClock, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { RecipeCookingTime, Recipes } from "@prisma/client";
import { formatTime } from "@/lib/formatTime";

interface RecipeTimeFormProps {
  initialData: Recipes & {
    recipeCookingTime: RecipeCookingTime | null;
  };
  recipeId: string;
}

const formSchema = z.object({
  prepTime: z.coerce.number(),
  cookTime: z.coerce.number(),
  restTime: z.coerce.number(),
});

export const RecipeTimeForm = ({
  initialData,
  recipeId,
}: RecipeTimeFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prepTime: initialData.recipeCookingTime?.prepTime || undefined,
      cookTime: initialData.recipeCookingTime?.cookTime || undefined,
      restTime: initialData.recipeCookingTime?.restTime || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/recipes/${recipeId}/recipe-cooking-time`, values);
      toast.success("Recipe Time updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating recipe time", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe Time
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.recipeCookingTime ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit time
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set time
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {initialData.recipeCookingTime?.prepTime ? (
            <p className="text-sm text-center">
              <span className="font-bold">Preparation time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(initialData.recipeCookingTime.prepTime)}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Preparation time</span>
              <span className="flex items-center justify-center">
                No preparation time set yet
              </span>
            </p>
          )}

          {initialData.recipeCookingTime?.cookTime ? (
            <p className="text-sm text-center">
              <span className="font-bold">Cooking time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(initialData.recipeCookingTime.cookTime)}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Cooking time</span>
              <span className="flex items-center justify-center">
                No cooking time set yet
              </span>
            </p>
          )}

          {initialData.recipeCookingTime?.restTime ? (
            <p className="text-sm text-center">
              <span className="font-bold">Rest time</span>
              <span className="flex items-center justify-center">
                <AlarmClock className="w-6 h-6 pr-2" />
                {formatTime(initialData.recipeCookingTime.restTime)}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Rest time</span>
              <span className="flex items-center justify-center">
                No rest time set yet
              </span>
            </p>
          )}

          <p className="text-sm text-center">
            <span className="font-bold">Total time</span>
            <span className="flex items-center justify-center">
              <AlarmClock className="w-6 h-6 pr-2" />
              {initialData.recipeCookingTime
                ? formatTime(
                    initialData.recipeCookingTime.prepTime +
                      initialData.recipeCookingTime.cookTime +
                      initialData.recipeCookingTime.restTime
                  )
                : "No time set yet"}
            </span>
          </p>
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Prepration Time</FormLabel>
                      <Input
                        type="number"
                        step={1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your recipe prepration time"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Cooking Time</FormLabel>
                      <Input
                        type="number"
                        step={1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your recipe cooking time"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Rest Time</FormLabel>
                      <Input
                        type="number"
                        step={1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set your recipe rest time"
                      />
                    </>
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
