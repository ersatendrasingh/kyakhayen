"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Pencil, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Courses, Faqs } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import ChapterList from "./ingredients-list";
import { Textarea } from "@/components/ui/textarea";
import FAQsList from "./faqs-list";

interface FAQFormProps {
  initialData: Courses & { faqs: Faqs[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Faq title is required" }),
  description: z.string().min(1, { message: "Faq description is required" }),
});

export const FAQForm = ({ initialData, courseId }: FAQFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreate = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/faqs`, values);
      toast.success("Course faq created successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleCreate();
      router.refresh();
    } catch {
      toast.error("Something went wrong while creating course faq", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/courses/${courseId}/faqs/reorder`, {
        list: updateData,
      });
      toast.success("Course faq reordered successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      router.refresh();
    } catch {
      toast.error("Something went wrong while reordering course faq", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/admin/courses/${courseId}/faqs/${id}`);
  };

  return (
    <div className="relative mt-6 border rounded-md p-4 bg-slate-100">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-700 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Course faqs
        <Button onClick={toggleCreate} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="w-6 h-6 pr-2" />
              Add a FAQ
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Question of Faq"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Answer of Faq"
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
            !initialData.faqs.length && "text-slate-500 italic"
          )}
        >
          {!initialData.faqs.length && "No faqs yet"}
          <FAQsList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.faqs || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the faqs
        </p>
      )}
    </div>
  );
};
