"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

import { Loader2, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { IngredientUnitMeasurements, Ingredients, Units } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import UnitMeasurementList from "./unit-measurement-list";

type MeasurementType = IngredientUnitMeasurements & {
  unit?: Units;
};

type IngredientType = Ingredients & {
  IngredientUnitMeasurements: MeasurementType[];
};
interface UnitMeasurementFormProps {
  initialData: IngredientType;
  ingredientId: string;
  options: { label: string; value: string }[];
}

const formSchema = z.object({
  values: z.coerce.number(),
  unitId: z.string().min(1),
});

export const UnitMeasurementForm = ({
  initialData,
  ingredientId,
  options,
}: UnitMeasurementFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitId: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(
        `/api/ingredients/${ingredientId}/unit-measurements`,
        values
      );
      toast.success("Ingredient unit measurement created successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      form.reset();
      toggleCreate();
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong while creating ingredient unit measurement",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    }
  };

  return (
    <div className="relative mt-6 border rounded-md p-4 bg-slate-100">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-700 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Unit Measurement
        <Button onClick={toggleCreate} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add new measurement
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
              <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
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
              <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                <FormField
                  control={form.control}
                  name="values"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Grams Value"
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
            !initialData.IngredientUnitMeasurements.length &&
              "text-slate-500 italic"
          )}
        >
          {!initialData.IngredientUnitMeasurements.length &&
            "No unit measurements yet"}
          <UnitMeasurementList
            ingredientId={ingredientId}
            items={initialData.IngredientUnitMeasurements || []}
            options={options}
          />
        </div>
      )}
    </div>
  );
};
