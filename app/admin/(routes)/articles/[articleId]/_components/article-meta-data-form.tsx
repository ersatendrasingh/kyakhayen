"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useState } from "react";
import axios from "axios";

interface ArticleMetaDataFormProps {
  initialData: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaSlug: string | null;
  };
  postId: string;
}

const SEO_LIMITS = {
  title: { min: 40, max: 60 },
  description: { min: 140, max: 160 },
};

const formSchema = z.object({
  metaTitle: z.string().min(1, { message: "Article Meta Title is required" }),
  metaDescription: z
    .string()
    .min(1, { message: "Article Meta Description is required" }),
  metaSlug: z.string().min(1, { message: "Article Meta Slug is required" }),
});

export const ArticleMetaDataForm = ({
  initialData,
  postId,
}: ArticleMetaDataFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metaTitle: initialData.metaTitle || "", // Ensure default is a string
      metaDescription: initialData.metaDescription || "",
      metaSlug: initialData.metaSlug || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const handleSlugChange = (value: string) => {
    return value.replace(/\s+/g, "-"); // Replace spaces with hyphens
  };

  const getProgressColor = (length: number, min: number, max: number) => {
    if (length < min) return "bg-gray-300";
    if (length >= min && length <= max) return "bg-green-500";
    return "bg-red-500";
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/articles/${postId}`, values);
      toast.success("Article meta data updated successfully", {
        duration: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating article meta data", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Article Meta Data
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="w-6 h-6 pr-2" />
              Edit Meta Data
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div>
          <h3 className="text-sm font-semibold">Meta Title</h3>
          <p className="text-sm mb-2">{initialData.metaTitle}</p>
          <h3 className="text-sm font-semibold">Meta Slug</h3>
          <p className="text-sm mb-2">{initialData.metaSlug}</p>
          <h3 className="text-sm font-semibold">Meta Description</h3>
          <p className="text-sm mb-2">{initialData.metaDescription}</p>
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
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., 'Healthy Breakfast'"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.trimStart())
                        }
                      />

                      <div className="mt-1 h-2 relative bg-gray-200 rounded">
                        <div
                          className={`h-2 absolute top-0 left-0 rounded ${getProgressColor(
                            (field.value || "").length, // Safeguard for null/undefined
                            SEO_LIMITS.title.min,
                            SEO_LIMITS.title.max
                          )}`}
                          style={{
                            width: `${Math.min(
                              ((field.value || "").length /
                                SEO_LIMITS.title.max) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        {(field.value || "").length}/{SEO_LIMITS.title.max}
                        characters
                      </p>
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="e.g., 'A delicious and healthy breakfast recipe to start your day right...'"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.trimStart())
                        }
                      />

                      <div className="mt-1 h-2 relative bg-gray-200 rounded">
                        <div
                          className={`h-2 absolute top-0 left-0 rounded ${getProgressColor(
                            field.value.length,
                            SEO_LIMITS.description.min,
                            SEO_LIMITS.description.max
                          )}`}
                          style={{
                            width: `${Math.min(
                              (field.value.length /
                                SEO_LIMITS.description.max) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        {field.value.length}/{SEO_LIMITS.description.max}{" "}
                        characters
                      </p>
                    </>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaSlug"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'healthy-breakfast-recipe'"
                      value={handleSlugChange(field.value)}
                      onChange={(e) =>
                        field.onChange(handleSlugChange(e.target.value))
                      }
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
