"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CuisineActionsProps {
  cuisineId: string;
}

export const CuisineActions = ({ cuisineId }: CuisineActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/recipes/cuisines/${cuisineId}`);
      toast.success("Cuisine deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.push(`/admin/recipes/cuisines`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong while deleting cuisine", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmModal onConfirm={onDelete}>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <Trash className="w-4 h-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
