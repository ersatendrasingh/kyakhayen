"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface IngredientActionsProps {
  ingredientId: string;
  disabled?: boolean;
  isPublished?: boolean;
}

export const IngredientActions = ({
  ingredientId,
  disabled,
  isPublished,
}: IngredientActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const confetti = useConfettiStore();

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/ingredients/${ingredientId}/unpublish`);
        toast.success("Ingredient unpublished successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        await axios.patch(`/api/ingredients/${ingredientId}/publish`);
        toast.success("Ingredient published successfully", {
          position: "top-center",
          autoClose: 5000,
        });
        confetti.onOpen();
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while unpublishing ingredient", {
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
      await axios.delete(`/api/ingredients/${ingredientId}`);
      toast.success("Ingredient deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.push(`/admin/ingredients`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong while deleting ingredient", {
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
