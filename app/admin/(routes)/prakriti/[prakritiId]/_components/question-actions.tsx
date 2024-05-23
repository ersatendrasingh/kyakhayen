"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
interface QuestionActionsProps {
  prakritiId: string;
  disabled?: boolean;
  isPublished?: boolean;
}

export const QuestionActions = ({
  prakritiId,
  disabled,
  isPublished,
}: QuestionActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/prakriti/${prakritiId}/unpublish`);
        toast.success("Question unpublished successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        await axios.patch(`/api/prakriti/${prakritiId}/publish`);
        toast.success("Question published successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while unpublishing question", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/prakriti/${prakritiId}`);
      toast.success("Question deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.push(`/admin/prakriti`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong while deleting prakriti", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <Trash className="w-4 h-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
