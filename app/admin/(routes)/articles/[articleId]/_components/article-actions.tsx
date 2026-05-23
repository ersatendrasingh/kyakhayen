"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface ArticleActionsProps {
  postId: string;
  disabled?: boolean;
  isPublished?: boolean;
}

export const ArticleActions = ({
  postId,
  disabled,
  isPublished,
}: ArticleActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const confetti = useConfettiStore();

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/articles/${postId}/unpublish`);
        toast.success("Article unpublished successfully", {
          duration: 5000,
        });
      } else {
        await axios.patch(`/api/articles/${postId}/publish`);
        toast.success("Article published successfully", {
          duration: 5000,
        });
        confetti.onOpen();
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while unpublishing article", {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/articles/${postId}`);
      toast.success("Article deleted successfully", {
        duration: 5000,
      });

      router.push(`/admin/articles`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong while deleting article", {
        duration: 5000,
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
