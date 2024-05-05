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

import { RecipeNutritionValues, Recipes } from "@prisma/client";
import { formatTime } from "@/lib/formatTime";

import Image from "next/image";

interface RecipeNutritionValuesFormProps {
  initialData: Recipes & {
    recipeNutritionValues: RecipeNutritionValues | null;
  };
  recipeId: string;
}

const formSchema = z.object({
  calories: z.coerce.number(),
  carbohydrate: z.coerce.number(),
  totalFat: z.coerce.number(),
  dietaryFiber: z.coerce.number(),
  protein: z.coerce.number(),
});

export const RecipeNutritionValuesForm = ({
  initialData,
  recipeId,
}: RecipeNutritionValuesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calories: initialData.recipeNutritionValues?.calories || undefined,
      carbohydrate:
        initialData.recipeNutritionValues?.carbohydrate || undefined,
      totalFat: initialData.recipeNutritionValues?.totalFat || undefined,
      dietaryFiber:
        initialData.recipeNutritionValues?.dietaryFiber || undefined,
      protein: initialData.recipeNutritionValues?.protein || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(
        `/api/recipes/${recipeId}/recipe-nutrition-values`,
        values
      );
      toast.success("Recipe nutrition values updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong while updating recipe nutrition values",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Recipe Nutrition Values
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.recipeNutritionValues ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit nutrition values
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set nutrition values
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {initialData.recipeNutritionValues?.calories ? (
            <p className="text-sm text-center">
              <span className="font-bold">Calories</span>
              <span className="flex items-center justify-center">
                <Image
                  src="/assets/images/calories-icon.png"
                  alt="Calories Icon"
                  width={25}
                  height={25}
                  className="pr-2"
                />

                {initialData.recipeNutritionValues?.calories}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Calories</span>
              <span className="flex items-center justify-center">
                No calories value set yet
              </span>
            </p>
          )}

          {initialData.recipeNutritionValues?.carbohydrate ? (
            <p className="text-sm text-center">
              <span className="font-bold">Carbohydrate</span>
              <span className="flex items-center justify-center">
                <Image
                  src="/assets/images/carbohydrate-icon.png"
                  alt="Calories Icon"
                  width={25}
                  height={25}
                  className="pr-2"
                />
                {initialData.recipeNutritionValues?.carbohydrate}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Carbohydrate</span>
              <span className="flex items-center justify-center">
                No carbohydrate value set yet
              </span>
            </p>
          )}

          {initialData.recipeNutritionValues?.totalFat ? (
            <p className="text-sm text-center">
              <span className="font-bold">Total Fat</span>
              <span className="flex items-center justify-center">
                <Image
                  src="/assets/images/fat-icon.png"
                  alt="Calories Icon"
                  width={25}
                  height={25}
                  className="pr-2"
                />
                {initialData.recipeNutritionValues?.totalFat}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Total Fat</span>
              <span className="flex items-center justify-center">
                No total fat value set yet
              </span>
            </p>
          )}

          {initialData.recipeNutritionValues?.dietaryFiber ? (
            <p className="text-sm text-center">
              <span className="font-bold">Dietary Fiber</span>
              <span className="flex items-center justify-center">
                <Image
                  src="/assets/images/fiber-icon.png"
                  alt="Calories Icon"
                  width={25}
                  height={25}
                  className="pr-2"
                />
                {initialData.recipeNutritionValues?.dietaryFiber}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Dietary Fiber</span>
              <span className="flex items-center justify-center">
                No dietary fiber value set yet
              </span>
            </p>
          )}
          {initialData.recipeNutritionValues?.protein ? (
            <p className="text-sm text-center">
              <span className="font-bold">Protein</span>
              <span className="flex items-center justify-center">
                <Image
                  src="/assets/images/protein-icon.png"
                  alt="Calories Icon"
                  width={25}
                  height={25}
                  className="pr-2"
                />
                {initialData.recipeNutritionValues?.protein}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Protein</span>
              <span className="flex items-center justify-center">
                No protein value set yet
              </span>
            </p>
          )}
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
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Calories</FormLabel>
                      <Input
                        type="number"
                        step={0.1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set recipe calories value"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carbohydrate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Carbohydrate</FormLabel>
                      <Input
                        type="number"
                        step={0.1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set recipe carbohydrate value"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalFat"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Total Fat</FormLabel>
                      <Input
                        type="number"
                        step={0.1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set recipe total fat"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryFiber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Dietary Fiber</FormLabel>
                      <Input
                        type="number"
                        step={0.1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set recipe dietary fiber"
                      />
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <FormLabel>Protein</FormLabel>
                      <Input
                        type="number"
                        step={0.1}
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Set recipe protein"
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
