"use client";

import { RecipeHealthBenefits } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Grip, Loader2, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import BenefitEditForm from "./benefit-edit-form";

interface BenefitsListProps {
  onReorder: (updateData: { id: string; position: number }[]) => void;
  recipeId: string;
  items: RecipeHealthBenefits[];
}

const BenefitsList = ({
  items,
  onReorder,

  recipeId,
}: BenefitsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [benefits, setBenefits] = useState(items);
  const [editingBenefitId, setEditingBenefitId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setBenefits(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(benefits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedBenefits = items.slice(startIndex, endIndex + 1);

    setBenefits(items);

    const bulkUpdateData = updatedBenefits.map((benefit) => ({
      id: benefit.id,
      position: items.findIndex((item) => item.id === benefit.id),
    }));

    onReorder(bulkUpdateData);
  };

  const handleEditClick = (id: string) => {
    setEditingBenefitId(id);
  };

  const handleEditCancel = () => {
    setEditingBenefitId("");
  };

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/recipes/${recipeId}/health-benefits/${id}`);
      toast.success("Recipe benefit deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting recipe benefit", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="benefits">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {benefits.map((benefit, index) => (
              <Draggable
                key={benefit.id}
                draggableId={benefit.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-emerald-100 border-emerald-200 text-emerald-700 rounded-md mb-4 text-sm"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-emerald-200 hover:bg-emerald-300 rounded-l-md transition"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {editingBenefitId === benefit.id ? (
                      <div className="w-full p-2">
                        <BenefitEditForm
                          benefit={benefit}
                          onCancel={handleEditCancel}
                          onSave={(updatedBenefit) => {
                            const updatedItems = [...benefits];
                            const index = updatedItems.findIndex(
                              (item) => item.id === updatedBenefit.id
                            );
                            if (index !== -1) {
                              updatedItems[index] = updatedBenefit;
                              setBenefits(updatedItems);
                            }
                            // Close edit form
                            setEditingBenefitId("");
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        {`${benefit.title} `}
                        <div className="ml-auto pr-2 flex items-center gap-x-2">
                          <div title="Edit">
                            <Pencil
                              onClick={() => handleEditClick(benefit.id)}
                              className="w-3 h-3 cursor-pointer hover:opacity-75 transition"
                            />
                          </div>
                          <div title="Delete">
                            {deletingId === benefit.id && (
                              <div className="ml-auto">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            {deletingId !== benefit.id && (
                              <ConfirmModal
                                onConfirm={() => onDelete(benefit.id)}
                              >
                                <X className="w-3 h-3 text-red-600 cursor-pointer hover:opacity-75 transition" />
                              </ConfirmModal>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default BenefitsList;
