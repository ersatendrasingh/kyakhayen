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

import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

import { Feature } from "@prisma/client";
import FeatureEditForm from "./feature-edit-form";
interface FeaturesListProps {
  onEdit: (id: string) => void;
  onReorder: (updateData: { id: string; position: number }[]) => void;
  planId: string;
  items: Feature[];
}

const FeaturesList = ({
  items,
  onReorder,
  onEdit,
  planId,
}: FeaturesListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [features, setFeatures] = useState(items);
  const [editingFeatureId, setEditingFeatureId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setFeatures(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedFeatures = items.slice(startIndex, endIndex + 1);

    setFeatures(items);

    const bulkUpdateData = updatedFeatures.map((feature) => ({
      id: feature.id,
      position: items.findIndex((item) => item.id === feature.id),
    }));

    onReorder(bulkUpdateData);
  };

  const handleEditClick = (id: string) => {
    setEditingFeatureId(id);
  };

  const handleEditCancel = () => {
    setEditingFeatureId("");
  };

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/subscription-plans/${planId}/features/${id}`);
      toast.success("Plan feature deleted successfully", {
        duration: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting plan feature", {
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="features">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {features.map((feature, index) => (
              <Draggable
                key={feature.id}
                draggableId={feature.id}
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
                        "px-2 py-3 border-r border-r-emerald-200 hover:bg-emerald-200 rounded-l-md transition"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {editingFeatureId === feature.id ? (
                      <div className="w-full p-2">
                        <FeatureEditForm
                          feature={feature}
                          onCancel={handleEditCancel}
                          onSave={(updatedFeature) => {
                            const updatedItems = [...features];
                            const index = updatedItems.findIndex(
                              (item) => item.id === updatedFeature.id
                            );
                            if (index !== -1) {
                              updatedItems[index] = updatedFeature;
                              setFeatures(updatedItems);
                            }
                            // Close edit form
                            setEditingFeatureId("");
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        {`${feature.name} `}
                        <div className="ml-auto pr-2 flex items-center gap-x-2">
                          <div title="Edit">
                            <Pencil
                              onClick={() => handleEditClick(feature.id)}
                              className="w-3 h-3 cursor-pointer hover:opacity-75 transition"
                            />
                          </div>
                          <div title="Delete">
                            {deletingId === feature.id && (
                              <div className="ml-auto">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            {deletingId !== feature.id && (
                              <ConfirmModal
                                onConfirm={() => onDelete(feature.id)}
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

export default FeaturesList;
