"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Courses } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CourseDetailsFormProps {
  initialData: Courses;
  courseId: string;
}

const formSchema = z.object({
  technologyRequirements: z
    .string()
    .min(1, { message: "Technology Requirements is required" }),
  eligibilityRequirements: z
    .string()
    .min(1, { message: "Eligibility Requirements is required" }),
  disclaimer: z.string().min(1, { message: "Disclaimer is required" }),
});

export const CourseDetailsForm = ({
  initialData,
  courseId,
}: CourseDetailsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technologyRequirements: initialData?.technologyRequirements || "",
      eligibilityRequirements: initialData?.eligibilityRequirements || "",
      disclaimer: initialData?.disclaimer || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course details updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating course details", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Course Details
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="w-6 h-6 pr-2" />
              Edit Details
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.technologyRequirements && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Technology Requirement : </span>
            {initialData.technologyRequirements ||
              "No technology requirement set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.eligibilityRequirements && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Eligibility Requirements : </span>
            {initialData.eligibilityRequirements ||
              "No eligibility requirements set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.disclaimer && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Disclaimer : </span>
            {initialData.disclaimer || "No disclaimer set yet"}
          </p>
        </>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="technologyRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology Requirements</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Technology Requirements"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eligibilityRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligibility Requirements</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Eligibility Requirements"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disclaimer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disclaimer</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Disclaimer"
                      {...field}
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
