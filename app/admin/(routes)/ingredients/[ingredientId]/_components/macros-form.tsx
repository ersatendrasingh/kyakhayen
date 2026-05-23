"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

import { Ingredients } from "@prisma/client";

import Image from "next/image";

interface MacrosFormProps {
  initialData: Ingredients;
  ingredientId: string;
}

const formSchema = z.object({
  calories: z.coerce.number(),
  carbohydrate: z.coerce.number(),
  totalFat: z.coerce.number(),
  dietaryFiber: z.coerce.number(),
  protein: z.coerce.number(),
});

export const MacrosForm = ({ initialData, ingredientId }: MacrosFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calories: initialData?.calories || undefined,
      carbohydrate: initialData?.carbohydrate || undefined,
      totalFat: initialData?.totalFat || undefined,
      dietaryFiber: initialData?.dietaryFiber || undefined,
      protein: initialData?.protein || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/ingredients/${ingredientId}`, values);
      toast.success("Ingredient macros values updated successfully", {
        duration: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong while updating ingredient macros values",
        {
          duration: 5000,
        }
      );
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Ingredient macros
        <p className="text-sm italic text-muted-foreground">
          Macros values per 100 g
        </p>
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.calories ||
              initialData.carbohydrate ||
              initialData.totalFat ||
              initialData.dietaryFiber ||
              initialData.protein ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit macros
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set macros values
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {initialData?.calories ? (
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

                {initialData?.calories}
              </span>
            </p>
          ) : (
            <p className="text-sm italic text-slate-500 text-center">
              <span className="font-bold">Energy</span>
              <span className="flex items-center justify-center">
                No calories value set yet
              </span>
            </p>
          )}

          {initialData?.carbohydrate ? (
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
                {initialData?.carbohydrate}
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

          {initialData?.totalFat ? (
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
                {initialData?.totalFat}
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

          {initialData?.dietaryFiber ? (
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
                {initialData?.dietaryFiber}
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
          {initialData?.protein ? (
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
                {initialData?.protein}
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
            <div className="flex items-center justify-between space-x-2 mt-2">
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
            </div>
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
