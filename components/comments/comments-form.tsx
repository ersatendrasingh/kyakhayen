"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import LoginPopup from "@/components/modals/login-popup";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { commentFormSchema } from "@/schemas";

interface CommentFormProps {
  postId?: string;
  recipeId?: string;
  parentId?: string;
  title?: string;
  onCommentAdded: () => void;
}

export const CommentsForm = ({
  postId,
  recipeId,
  parentId,
  title,
  onCommentAdded,
}: CommentFormProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const user = useCurrentUser();

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof commentFormSchema>) => {
    try {
      if (!user) {
        setShowPopup(true);
        return;
      }
      const data = {
        ...values,
        recipeId: recipeId || null,
        postId: postId || null,
        parentCommentId: parentId || null,
      };

      const response = await axios.post("/api/comments", data);

      if (response.status === 200) {
        form.reset();
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
      <h3 className="text-2xl font-bold">
        {title ? title : "Leave a Comment"}
      </h3>
      {user ? (
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
      ) : (
        <div className="flex items-center justify-center text-center mt-4">
          <Button
            variant="destructive"
            size="default"
            onClick={() => setShowPopup(true)}
            className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
          >
            Login to Comment
          </Button>
        </div>
      )}
      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};
