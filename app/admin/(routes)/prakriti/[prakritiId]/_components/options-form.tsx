"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

import { Loader2, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import OptionsList from "./options-list";

type PrakritiQuestionOption = {
  id: string;
  value: string;
  questionId: string;
  prakritiId: string;
  position: number;
  parkriti: Prakriti | null;
};

type Prakriti = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

type PrakritiQuestion = {
  id: string;
  question: string;
  isPublished: boolean;
  options: PrakritiQuestionOption[];
};
interface OptionsFormProps {
  initialData: PrakritiQuestion;
  prakritiId: string;
  options: { label: string; value: string }[];
}

const formSchema = z.object({
  prakritiId: z.string().min(1),
  value: z.string().min(1),
});

export const OptionsForm = ({
  initialData,
  prakritiId,
  options,
}: OptionsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prakritiId: "",
      value: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/prakriti/${prakritiId}/options`, values);
      toast.success("Option created successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      form.reset();
      toggleCreate();
      router.refresh();
    } catch {
      toast.error("Something went wrong while creating option", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/prakriti/${prakritiId}/options/reorder`, {
        list: updateData,
      });
      toast.success("Options reordered successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      router.refresh();
    } catch {
      toast.error("Something went wrong while reordering options", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUpdating(false);
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
        Prakriti Question Options
        <Button onClick={toggleCreate} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add a options
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
              <div className="w-full px-2 mb-4 md:mb-0">
                <FormField
                  control={form.control}
                  name="prakritiId"
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
                          placeholder="Select Prakriti"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
              <div className="w-full  px-2 mb-4 ">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          {...field}
                          placeholder="Options"
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
            !initialData.options.length && "text-slate-500 italic"
          )}
        >
          {!initialData.options.length && "No options yet"}
          <OptionsList
            onReorder={onReorder}
            prakritiId={prakritiId}
            items={initialData.options || []}
            options={options}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the options
        </p>
      )}
    </div>
  );
};
