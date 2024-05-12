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

import { Ingredients } from "@prisma/client";

import Image from "next/image";

interface MicrosFormProps {
  initialData: Ingredients;
  ingredientId: string;
}

const formSchema = z.object({
  vitaminA: z.coerce.number(),
  ascorbicAcids: z.coerce.number(),
  vitaminD: z.coerce.number(),
  tocopherolEquivalent: z.coerce.number(),
  vitaminK: z.coerce.number(),
  thiamine: z.coerce.number(),
  riboflavin: z.coerce.number(),
  totalB6: z.coerce.number(),
  folates: z.coerce.number(),
  calcium: z.coerce.number(),
  iron: z.coerce.number(),
  phophorus: z.coerce.number(),
  potassium: z.coerce.number(),
  sodium: z.coerce.number(),
  zinc: z.coerce.number(),
});

export const MicrosForm = ({ initialData, ingredientId }: MicrosFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vitaminA:
        initialData?.vitaminA !== null ? initialData?.vitaminA : 0 || undefined,
      ascorbicAcids:
        initialData?.ascorbicAcids !== null
          ? initialData?.ascorbicAcids
          : 0 || undefined,
      vitaminD:
        initialData?.vitaminD !== null ? initialData?.vitaminD : 0 || undefined,
      tocopherolEquivalent:
        initialData?.tocopherolEquivalent !== null
          ? initialData?.tocopherolEquivalent
          : 0 || undefined,
      vitaminK:
        initialData?.vitaminK !== null ? initialData?.vitaminK : 0 || undefined,
      thiamine:
        initialData?.thiamine !== null ? initialData?.thiamine : 0 || undefined,
      riboflavin:
        initialData?.riboflavin !== null
          ? initialData?.riboflavin
          : 0 || undefined,
      totalB6:
        initialData?.totalB6 !== null ? initialData?.totalB6 : 0 || undefined,
      folates:
        initialData?.folates !== null ? initialData?.folates : 0 || undefined,
      calcium:
        initialData?.calcium !== null ? initialData?.calcium : 0 || undefined,
      iron: initialData?.iron !== null ? initialData?.iron : 0 || undefined,
      phophorus:
        initialData?.phophorus !== null
          ? initialData?.phophorus
          : 0 || undefined,
      potassium:
        initialData?.potassium !== null
          ? initialData?.potassium
          : 0 || undefined,
      sodium:
        initialData?.sodium !== null ? initialData?.sodium : 0 || undefined,
      zinc: initialData?.zinc !== null ? initialData?.zinc : 0 || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/ingredients/${ingredientId}`, values);
      toast.success("Ingredient micros values updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong while updating ingredient micros values",
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
        Ingredient micros
        <p className="text-sm italic text-muted-foreground">
          Micros values per 100 g
        </p>
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {initialData.vitaminA ||
              initialData.ascorbicAcids ||
              initialData.vitaminD ||
              initialData.tocopherolEquivalent ||
              initialData.thiamine ||
              initialData.riboflavin ||
              initialData.totalB6 ||
              initialData.folates ||
              initialData.calcium ||
              initialData.iron ||
              initialData.phophorus ||
              initialData.potassium ||
              initialData.sodium ||
              initialData.zinc ||
              initialData.vitaminK ? (
                <>
                  <Pencil className="w-6 h-6 pr-2" /> Edit micros
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 pr-2" />
                  Set micros values
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          <div className="flex items-center justify-between gap-x-2 mt-4">
            {initialData?.vitaminA !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Vitamin A - µg</span>
                <span className="flex items-center justify-center">
                  {initialData?.vitaminA}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Vitamin A - µg</span>
                <span className="flex items-center justify-center">
                  No Vitamin A - µg value set yet
                </span>
              </p>
            )}

            {initialData?.ascorbicAcids !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Ascorbic acids (C) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.ascorbicAcids}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Ascorbic acids (C) - mg</span>
                <span className="flex items-center justify-center">
                  No Ascorbic acids (C) - mg value set yet
                </span>
              </p>
            )}

            {initialData?.vitaminD !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Vitamin D - µg</span>
                <span className="flex items-center justify-center">
                  {initialData?.vitaminD}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Vitamin D - µg</span>
                <span className="flex items-center justify-center">
                  No vitamin D - µg value set yet
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-x-2 mt-4">
            {initialData?.tocopherolEquivalent !== null ? (
              <p className="text-xs text-center">
                <span className="font-bold">
                  Tocopherol equivalent (E) - mg
                </span>
                <span className="flex items-center justify-center">
                  {initialData?.tocopherolEquivalent}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold text-xs">
                  Tocopherol equivalent (E) - mg
                </span>
                <span className="flex items-center justify-center">
                  No Tocopherol equivalent (E) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.vitaminK !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Vitamin K - µg</span>
                <span className="flex items-center justify-center">
                  {initialData?.vitaminK}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Vitamin K - µg</span>
                <span className="flex items-center justify-center">
                  No Vitamin K - µg value set yet
                </span>
              </p>
            )}
            {initialData?.thiamine !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Thiamine (B1) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.thiamine}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Thiamine (B1) - mg</span>
                <span className="flex items-center justify-center">
                  No Thiamine (B1) - mg value set yet
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-x-2 mt-4">
            {initialData?.riboflavin !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Riboflavin (B2) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.riboflavin}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Riboflavin (B2) - mg</span>
                <span className="flex items-center justify-center">
                  No Riboflavin (B2) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.totalB6 !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Total B6 - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.totalB6}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Total B6 - mg</span>
                <span className="flex items-center justify-center">
                  No Total B6 - mg value set yet
                </span>
              </p>
            )}
            {initialData?.folates !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Folates (B9) - µg</span>
                <span className="flex items-center justify-center">
                  {initialData?.folates}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Folates (B9) - µg</span>
                <span className="flex items-center justify-center">
                  No Folates (B9) - µg value set yet
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-x-2 mt-4">
            {initialData?.calcium !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Calcium (Ca) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.calcium}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Calcium (Ca) - mg</span>
                <span className="flex items-center justify-center">
                  No Calcium (Ca) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.iron !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Iron (Fe) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.iron}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Iron (Fe) - mg</span>
                <span className="flex items-center justify-center">
                  No Iron (Fe) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.phophorus !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Phophorus (P) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.phophorus}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Phophorus (P) - mg</span>
                <span className="flex items-center justify-center">
                  No Phophorus (P) - mg value set yet
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-x-2 mt-4">
            {initialData?.potassium !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Potassium (K) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.potassium}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Potassium (K) - mg</span>
                <span className="flex items-center justify-center">
                  No Potassium (K) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.sodium !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Sodium (Na) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.sodium}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Sodium (Na) - mg</span>
                <span className="flex items-center justify-center">
                  No Sodium (Na) - mg value set yet
                </span>
              </p>
            )}
            {initialData?.zinc !== null ? (
              <p className="text-sm text-center">
                <span className="font-bold">Zinc (Zn) - mg</span>
                <span className="flex items-center justify-center">
                  {initialData?.zinc}
                </span>
              </p>
            ) : (
              <p className="text-sm italic text-slate-500 text-center">
                <span className="font-bold">Zinc (Zn) - mg</span>
                <span className="flex items-center justify-center">
                  No Zinc (Zn) - mg value set yet
                </span>
              </p>
            )}
          </div>
        </>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <div className="flex items-center justify-between space-x-2 mt-4">
              <FormField
                control={form.control}
                name="vitaminA"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Vitamin A - µg</FormLabel>
                        <Input
                          type="number"
                          step={0.00000001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient vitamin A value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ascorbicAcids"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Ascorbic acids (C) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.00000001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient ascorbic acids value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vitaminD"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Vitamin D - µg</FormLabel>
                        <Input
                          type="number"
                          step={0.00000001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient vitamin D value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 mt-4">
              <FormField
                control={form.control}
                name="tocopherolEquivalent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Tocopherol equivalent (E) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.01}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient tocopherol equivalent value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vitaminK"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Vitamin K - µg</FormLabel>
                        <Input
                          type="number"
                          step={0.00000001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient vitamin K value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thiamine"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Thiamine (B1) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.01}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient thiamine (B1) value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 mt-4">
              <FormField
                control={form.control}
                name="riboflavin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Riboflavin (B2) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.1}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient riboflavin (B2) value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalB6"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Total B6 - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.00001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient total B6 value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="folates"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Folates (B9) - µg</FormLabel>
                        <Input
                          type="number"
                          step={0.00000001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient folates value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 mt-4">
              <FormField
                control={form.control}
                name="calcium"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Calcium (Ca) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.00001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient calcium value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iron"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Iron (Fe) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.00001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient iron value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phophorus"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Phophorus (P) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient phosphorus value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 mt-4">
              <FormField
                control={form.control}
                name="potassium"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Potassium (K) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient potassium value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sodium"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Sodium (Na) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.00001}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient sodium value"
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zinc"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <FormLabel>Zinc (Zn) - mg</FormLabel>
                        <Input
                          type="number"
                          step={0.01}
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Set ingredient zinc value"
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
