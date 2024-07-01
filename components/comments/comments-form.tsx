"use client";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Define schema for form validation
const commentFormSchema = (isLoggedIn: boolean) =>
  z.object({
    name: isLoggedIn ? z.string().optional() : z.string().min(2).max(50),
    email: isLoggedIn ? z.string().optional() : z.string().email(),
    phoneNumber: isLoggedIn ? z.string().optional() : z.string().min(7).max(15),
    comment: z.string().min(10).max(500),
  });

interface CommentFormProps {
  recipeId: string;
  parentId?: string;
  title?: string;
  onCommentAdded: () => void;
}

export const CommentsForm = ({
  recipeId,
  parentId,
  title,
  onCommentAdded,
}: CommentFormProps) => {
  const user = useCurrentUser();
  const isLoggedIn = Boolean(user);

  // Initialize react-hook-form with zod schema resolver
  const form = useForm({
    resolver: zodResolver(commentFormSchema(isLoggedIn)),
    defaultValues: {
      name: isLoggedIn ? user?.name || "" : "",
      email: isLoggedIn ? user?.email || "" : "",
      phoneNumber: isLoggedIn ? user?.phoneNumber || "" : "",
      comment: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (
    formData: z.infer<ReturnType<typeof commentFormSchema>>
  ) => {
    try {
      const token = uuidv4();
      localStorage.setItem("userEmail", formData.email || "");
      localStorage.setItem("userPhoneNumber", formData.phoneNumber || "");
      localStorage.setItem("commentToken", token);
      const data = {
        ...formData,
        recipeId,
        parentCommentId: parentId || null,
        token,
      };

      const response = await axios.post("/api/comments", data);

      if (response.status === 200) {
        form.reset(); // Reset form fields on successful submission

        onCommentAdded();

        toast.success("Comment added successfully!", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error:", error.message);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">
        {title ? title : "Leave a Comment"}
      </h1>
      <div className="space-y-8 mt-2 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        {...field}
                        placeholder="Write your comment..."
                        className={cn(
                          "w-full h-32 rounded-md",
                          title && "h-12"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!isLoggedIn && (
              <>
                <div className="grid grid-cols-1 gap-4 my-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="Full Name"
                            {...field}
                            className="w-full h-12 rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 my-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            disabled={isSubmitting}
                            placeholder="Email"
                            {...field}
                            className="w-full h-12 rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 my-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="Phone Number"
                            {...field}
                            className="w-full h-12 rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-end mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
              >
                {isSubmitting
                  ? "Submitting..."
                  : title
                  ? "Submit Reply"
                  : "Submit Comment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
