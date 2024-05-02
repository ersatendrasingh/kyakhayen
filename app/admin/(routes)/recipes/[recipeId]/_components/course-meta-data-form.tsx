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

interface CourseMetaDataFormProps {
  initialData: Courses;
  courseId: string;
}

const formSchema = z.object({
  duration: z.string().min(1, { message: "Course duration is required" }),
  mode: z.string().min(1, { message: "Course mode is required" }),
  certificate: z.string().min(1, { message: "Course Certificate is required" }),
  exams: z.string().min(1, { message: "Course Exams is required" }),
  experienceLevel: z
    .string()
    .min(1, { message: "Course Experience Level is required" }),
  studyMaterial: z
    .string()
    .min(1, { message: "Course Study Material is required" }),
  additionalBook: z
    .string()
    .min(1, { message: "Course Additional Book is required" }),
  language: z.string().min(1, { message: "Course Language is required" }),
});

export const CourseMetaDataForm = ({
  initialData,
  courseId,
}: CourseMetaDataFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: initialData?.duration || "",
      mode: initialData?.mode || "",
      certificate: initialData?.certificate || "",
      exams: initialData?.exams || "",
      experienceLevel: initialData?.experienceLevel || "",
      studyMaterial: initialData?.studyMaterial || "",
      additionalBook: initialData?.additionalBook || "",
      language: initialData?.language || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course meta data updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating course meta data", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  return (
    <div className="mt-6 border rounded-md p-4 bg-slate-100">
      <div className="flex items-center justify-between font-medium">
        Course Meta Data
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
        <>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.duration && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Duration : </span>
            {initialData.duration || "No course duration set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.mode && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Mode : </span>
            {initialData.mode || "No course mode set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.certificate && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Certificate : </span>
            {initialData.certificate || "No course certificate set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.exams && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Exams : </span>
            {initialData.exams || "No course exams set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.experienceLevel && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Experience Level : </span>
            {initialData.experienceLevel ||
              "No course experience level set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.studyMaterial && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Study Material : </span>
            {initialData.studyMaterial || "No course study material set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.additionalBook && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Additional Book : </span>
            {initialData.additionalBook || "No course additional book set yet"}
          </p>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.language && "italic text-slate-500"
            )}
          >
            <span className="font-bold mr-2">Course Languages : </span>
            {initialData.language || "No course languages set yet"}
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. '30 days'"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'online'"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course certificate</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course certificate"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course exams</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course exams"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course experience level</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course experience level"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studyMaterial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course study material</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course study material"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalBook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course additional book</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course additional book"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course languages</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Course languages"
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
