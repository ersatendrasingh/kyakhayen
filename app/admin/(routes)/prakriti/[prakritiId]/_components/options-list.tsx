"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Grip, Loader2, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";

//import IngredientEditForm from "./ingredient-edit-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import OptionEditForm from "./option-edit-form";
type PrakritiQuestionOption = {
  id: string;
  value: string;
  questionId: string;
  prakritiId: string;
  position: number;
  parkriti: Prakriti | null;
};

type Prakriti = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

interface OptionsListProps {
  onReorder: (updateData: { id: string; position: number }[]) => void;
  items: PrakritiQuestionOption[];
  prakritiId: string;
  options: { label: string; value: string }[];
}

const OptionsList = ({
  items,
  onReorder,
  options,
  prakritiId,
}: OptionsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [questionOptions, setQuestionOptions] = useState(items);
  const [editingOptionId, setEditingOptionId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setQuestionOptions(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(questionOptions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedOptions = items.slice(startIndex, endIndex + 1);

    setQuestionOptions(items);

    const bulkUpdateData = updatedOptions.map((questionOption) => ({
      id: questionOption.id,
      position: items.findIndex((item) => item.id === questionOption.id),
    }));

    onReorder(bulkUpdateData);
  };

  const handleEditClick = (id: string) => {
    setEditingOptionId(id);
  };

  const handleEditCancel = () => {
    setEditingOptionId("");
  };

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/prakriti/${prakritiId}/options/${id}`);
      toast.success("Question option deleted successfully", {
        position: "top-center",
        autoClose: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting the question option", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="options">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {questionOptions.map((questionOption, index) => (
              <Draggable
                key={questionOption.id}
                draggableId={questionOption.id}
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
                        editingOptionId === questionOption.id && "hidden"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {editingOptionId === questionOption.id ? (
                      <div className="w-full p-2">
                        <OptionEditForm
                          questionOptions={questionOption}
                          options={options}
                          onCancel={handleEditCancel}
                          onSave={(updatedOption) => {
                            // Update the ingredient in the list
                            const updatedItems = [...questionOptions];
                            const index = updatedItems.findIndex(
                              (item) => item.id === updatedOption.id
                            );
                            if (index !== -1) {
                              updatedItems[index] = updatedOption;
                              setQuestionOptions(updatedItems);
                            }
                            // Close edit form
                            setEditingOptionId("");
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        {`${questionOption.parkriti?.title} - ${questionOption.value}`}
                        <div className="ml-auto pr-2 flex items-center gap-x-2">
                          <div title="Edit">
                            <Pencil
                              onClick={() => handleEditClick(questionOption.id)}
                              className="w-3 h-3 cursor-pointer hover:opacity-75 transition"
                            />
                          </div>
                          <div title="Delete">
                            {deletingId === questionOption.id && (
                              <div className="ml-auto">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            {deletingId !== questionOption.id && (
                              <ConfirmModal
                                onConfirm={() => onDelete(questionOption.id)}
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

export default OptionsList;
