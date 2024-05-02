"use client";

import { RecipeIngredients, RecipeMethods, Units } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Grip, Loader2, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { IngredientsForm } from "./ingredients-form";
import IngredientEditForm from "./ingredient-edit-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type RecipeIngredient = RecipeIngredients & {
  unit?: Units;
};

interface MethodsListProps {
  onEdit: (id: string) => void;
  onReorder: (updateData: { id: string; position: number }[]) => void;
  recipeId: string;
  items: RecipeMethods[];
}

const MethodsList = ({
  items,
  onReorder,
  onEdit,
  recipeId,
}: MethodsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [methods, setMethods] = useState(items);
  const [editingIngredientId, setEditingIngredientId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMethods(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(methods);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedMethods = items.slice(startIndex, endIndex + 1);

    setMethods(items);

    const bulkUpdateData = updatedMethods.map((method) => ({
      id: method.id,
      position: items.findIndex((item) => item.id === method.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/recipes/${recipeId}/methods/${id}`);
      toast.success("Recipe method deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting recipe method", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="methods">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {methods.map((method, index) => (
              <Draggable key={method.id} draggableId={method.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      method.isPublished &&
                        "bg-rose-100 border-rose-200 text-rose-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        method.isPublished &&
                          "border-r-rose-200 hover:bg-rose-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>

                    {`${method.title} `}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          method.isPublished && "bg-rose-700"
                        )}
                      >
                        {method.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div title="Edit">
                        <Pencil
                          onClick={() => onEdit(method.id)}
                          className="w-3 h-3 cursor-pointer hover:opacity-75 transition"
                        />
                      </div>
                      <div title="Delete">
                        {deletingId === method.id && (
                          <div className="ml-auto">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                        {deletingId !== method.id && (
                          <ConfirmModal onConfirm={() => onDelete(method.id)}>
                            <X className="w-3 h-3 text-red-600 cursor-pointer hover:opacity-75 transition" />
                          </ConfirmModal>
                        )}
                      </div>
                    </div>
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

export default MethodsList;
