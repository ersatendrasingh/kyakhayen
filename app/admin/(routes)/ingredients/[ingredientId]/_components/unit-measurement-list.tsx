"use client";

import {
  Ingredients,
  Units,
  IngredientsForm as IngredientsFormType,
  IngredientUnitMeasurements,
} from "@prisma/client";
import { useEffect, useState } from "react";

import { Grip, Loader2, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";

// import IngredientEditForm from "./ingredient-edit-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type MeasurementType = IngredientUnitMeasurements & {
  unit?: Units;
};
type IngredientType = Ingredients & {
  IngredientUnitMeasurements: MeasurementType[];
};
interface UnitMeasurementListProps {
  items: MeasurementType[];
  ingredientId: string;
  options: { label: string; value: string }[];
}

const UnitMeasurementList = ({
  items,

  options,
  ingredientId,
}: UnitMeasurementListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [unitmeasurements, setUnitmeasurements] = useState(items);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setUnitmeasurements(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(
        `/api/ingredients/${ingredientId}/unit-measurements/${id}`
      );
      toast.success("Measurement deleted successfully", {
        duration: 5000,
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting measurement", {
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {unitmeasurements.map((unitmeasurement, index) => (
        <div
          key={unitmeasurement.id}
          className={cn(
            "flex items-center gap-x-2   border bg-emerald-100 border-emerald-200 text-emerald-700 rounded-md mb-4 text-sm font-semibold"
          )}
        >
          <div
            className={cn(
              "px-2 py-3 border-r  rounded-l-md transition border-r-emerald-200 hover:bg-emerald-200"
            )}
          >
            <Grip className="h-5 w-5" />
          </div>

          <>
            {`1 ${unitmeasurement.unit?.title} = ${unitmeasurement.values} Grams`}
            <div className="ml-auto pr-2 flex items-center gap-x-2">
              <div title="Delete">
                {deletingId === unitmeasurement.id && (
                  <div className="ml-auto">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
                {deletingId !== unitmeasurement.id && (
                  <ConfirmModal onConfirm={() => onDelete(unitmeasurement.id)}>
                    <X className="w-3 h-3 text-red-600 cursor-pointer hover:opacity-75 transition" />
                  </ConfirmModal>
                )}
              </div>
            </div>
          </>
        </div>
      ))}
    </div>
  );
};

export default UnitMeasurementList;
