import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
interface OptionEditFormProps {
  questionOptions: PrakritiQuestionOption;
  onCancel: () => void;
  options: { label: string; value: string }[];

  onSave: (updatedOption: PrakritiQuestionOption) => void;
}
const OptionEditForm = ({
  questionOptions,
  onCancel,
  onSave,
  options,
}: OptionEditFormProps) => {
  const [editedOption, setEditedOption] = useState(questionOptions);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedOption((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formSchema = z.object({
    prakritiId: z.string().min(1),
    value: z.string().min(1),
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/prakriti/${questionOptions.questionId}/options/${questionOptions.id}`,
        values
      );
      toast.success("Option updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      onSave({ ...questionOptions, ...values });

      router.refresh();
    } catch {
      toast.error("Something went wrong while updating the option", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prakritiId: questionOptions.prakritiId.toString(),
      value: questionOptions.value,
    },
  });
  const { isSubmitting, isValid } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
          <div className="w-full px-2 mb-4">
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
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OptionEditForm;
