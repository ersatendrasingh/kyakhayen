"use client";

import {
  RecipeIngredients as RecipeIngredientsType,
  Units,
} from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { cn } from "@/lib/utils";

type RecipeIngredients = {
  id: string;
  name: string;
  quantity: number;
  position: number;
  recipeId: string;
  unitId: string;
  notes?: string | null;
  unit: Units;
};
interface RecipeIngredientsProps {
  recipeIngredients: RecipeIngredients[];
  quantity: number;
}

const RecipeIngredients = ({
  recipeIngredients,
  quantity,
}: RecipeIngredientsProps) => {
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const handleCheckboxChange = (ingredientId: string) => {
    if (checkedIngredients.includes(ingredientId)) {
      // If already checked, remove from the list
      setCheckedIngredients(
        checkedIngredients.filter((id) => id !== ingredientId)
      );
    } else {
      // If not checked, add to the list
      setCheckedIngredients([...checkedIngredients, ingredientId]);
    }
  };

  return (
    <div className="w-full">
      {recipeIngredients.length === 0 ? (
        <p className="text-sm font-medium text-center text-websecondary-500">
          No ingredients available for this recipe.
        </p>
      ) : (
        <ul>
          {recipeIngredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center py-2">
              <Checkbox
                id={ingredient.id}
                className="mr-3 text-white border-websecondary-500 data-[state=checked]:bg-websecondary-500 data-[state=checked]:text-rose-foreground"
                checked={checkedIngredients.includes(ingredient.id)}
                onCheckedChange={() => handleCheckboxChange(ingredient.id)}
              />
              <label
                htmlFor={ingredient.id}
                className={cn(
                  "truncate",
                  checkedIngredients.includes(ingredient.id)
                    ? "text-websecondary-500 line-through opacity-75"
                    : "text-foreground"
                )}
              >
                <span className="mr-1">
                  {Number(ingredient.quantity) * quantity}
                </span>
                <span className="mr-1">{ingredient.unit?.title}</span>
                <span className="mr-1">{ingredient.name}</span>
                <span className="mr-1">({ingredient.notes})</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeIngredients;
