"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import UploadDropZone from "@/components/imageUpload/upload-dropzone";

const formSchema = z.object({
  title: z.string().min(1, { message: "Nutrient title is required" }),
  imageUrl: z.string().optional(),
});

const NutrientForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [key, setKey] = useState<number>(0);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("imageUrl", image as Blob);
      const response = await axios.post("/api/recipes/nutrients", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        form.reset();
        setImage(null); // Reset image state
        setKey((prevKey) => prevKey + 1);
        router.refresh();
        toast.success("Nutrient created successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch {
      toast.error("Something went wrong while creating nutrient", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  const handleImageUpload = (file: File) => {
    setImage(file);
  };
  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl">Nutrients</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nutrient Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Calories'"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <UploadDropZone
              acceptedFileTypes={"image/*"}
              onImageUpload={handleImageUpload}
              key={key}
            />

            <div className="flex items-center justify-end gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NutrientForm;
