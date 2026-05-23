"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface PlanActionsProps {
  planId: string;
  disabled?: boolean;
  isPublished?: boolean;
}

export const PlanActions = ({
  planId,
  disabled,
  isPublished,
}: PlanActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const confetti = useConfettiStore();

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/subscription-plans/${planId}/unpublish`);
        toast.success("Subscription plan unpublished successfully", {
          duration: 5000,
        });
      } else {
        await axios.patch(`/api/subscription-plans/${planId}/publish`);
        toast.success("Subscription plan published successfully", {
          duration: 5000,
        });
        confetti.onOpen();
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while unpublishing subscription plan", {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/subscription-plans/${planId}`);
      toast.success("Subscription plan deleted successfully", {
        duration: 5000,
      });

      router.push(`/admin/subscription-plans`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong while deleting subscription plan", {
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
