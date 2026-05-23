"use client";

import {
  Ingredients,
  RecipeIngredients,
  Units,
  IngredientsForm as IngredientsFormType,
} from "@prisma/client";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type RecipeIngredient = RecipeIngredients & {
  unit?: Units;
  ingredientForm?: IngredientsFormType;
  ingredient?: Ingredients;
};

interface IngredientsListProps {
  onEdit: (id: string) => void;
  onReorder: (updateData: { id: string; position: number }[]) => void;
  items: RecipeIngredient[];
  recipeId: string;
  options: { label: string; value: string }[];
  ingredientsData: {
    value: string;
    label: string;
  }[];
  forms: {
    value: string;
    label: string;
  }[];
}

const IngredientsList = ({
  items,
  onReorder,
  onEdit,
  options,
  recipeId,
  ingredientsData,
  forms,
}: IngredientsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [ingredients, setIngredients] = useState(items);
  const [editingIngredientId, setEditingIngredientId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setIngredients(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedIngredients = items.slice(startIndex, endIndex + 1);

    setIngredients(items);

    const bulkUpdateData = updatedIngredients.map((ingredient) => ({
      id: ingredient.id,
      position: items.findIndex((item) => item.id === ingredient.id),
    }));

    onReorder(bulkUpdateData);
  };

  const handleEditClick = (id: string) => {
    setEditingIngredientId(id);
  };

  const handleEditCancel = () => {
    setEditingIngredientId("");
  };

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/recipes/${recipeId}/ingredients/${id}`);
      toast.success("Recipe ingredient deleted successfully", {
        duration: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting recipe ingredient", {
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {ingredients.map((ingredient, index) => (
              <Draggable
                key={ingredient.id}
                draggableId={ingredient.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2   border bg-emerald-100 border-emerald-200 text-emerald-700 rounded-md mb-4 text-sm font-semibold"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r  rounded-l-md transition border-r-emerald-200 hover:bg-emerald-200",
                        editingIngredientId === ingredient.id && "hidden"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {editingIngredientId === ingredient.id ? (
                      <div className="w-full p-2">
                        <IngredientEditForm
                          ingredient={ingredient}
                          options={options}
                          ingredientsData={ingredientsData}
                          forms={forms}
                          onCancel={handleEditCancel}
                          onSave={(updatedIngredient) => {
                            // Update the ingredient in the list
                            const updatedItems = [...ingredients];
                            const index = updatedItems.findIndex(
                              (item) => item.id === updatedIngredient.id
                            );
                            if (index !== -1) {
                              updatedItems[index] = updatedIngredient;
                              setIngredients(updatedItems);
                            }
                            // Close edit form
                            setEditingIngredientId("");
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        {`${ingredient.quantity} ${ingredient.unit?.title} ${ingredient.ingredient?.name} (${ingredient.ingredientForm?.name})`}
                        <div className="ml-auto pr-2 flex items-center gap-x-2">
                          <div title="Edit">
                            <Pencil
                              onClick={() => handleEditClick(ingredient.id)}
                              className="w-3 h-3 cursor-pointer hover:opacity-75 transition"
                            />
                          </div>
                          <div title="Delete">
                            {deletingId === ingredient.id && (
                              <div className="ml-auto">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            {deletingId !== ingredient.id && (
                              <ConfirmModal
                                onConfirm={() => onDelete(ingredient.id)}
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

export default IngredientsList;
