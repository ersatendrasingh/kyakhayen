import { RecipeMethods as RecipeMethodsType } from "@prisma/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

import { Preview } from "../preview";

interface RecipeMethodsProps {
  recipeMethods: RecipeMethodsType[];
}

const RecipeMethods = ({ recipeMethods }: RecipeMethodsProps) => {
  const [checkedMethod, setCheckedMethod] = useState<string[]>([]);

  const handleCheckboxChange = (methodId: string) => {
    setCheckedMethod((prevChecked) =>
      prevChecked.includes(methodId)
        ? prevChecked.filter((id) => id !== methodId)
        : [...prevChecked, methodId]
    );
  };

  return (
    <div className="w-full">
      {recipeMethods.length === 0 ? (
        <p className="text-sm font-medium text-center text-websecondary-500">
          No methods available for this recipe.
        </p>
      ) : (
        <ul>
          {recipeMethods.map((method, index) => (
            <li key={method.id} className="flex flex-col py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center mb-3">
                  <span className="text-lg font-semibold bg-websecondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                </div>
                <div className="flex items-center mb-3">
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      checkedMethod.includes(method.id)
                        ? "text-websecondary-500 line-through opacity-75"
                        : "text-foreground"
                    )}
                  >
                    {method.title}
                  </p>
                </div>
              </div>
              {method.description && (
                <Preview
                  value={method.description}
                  className={cn(
                    "text-md font-lg pb-5",
                    checkedMethod.includes(method.id)
                      ? "text-gray-500 line-through opacity-75"
                      : "text-foreground"
                  )}
                />
              )}
              {method.imageUrl && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={method.imageUrl}
                    alt={method.title}
                    width={950}
                    height={600}
                    className="rounded-md"
                  />
                </div>
              )}
              <div className="flex items-center my-4">
                <Checkbox
                  id={method.id}
                  className="mr-3 text-white border-websecondary-500 data-[state=checked]:bg-websecondary-500 data-[state=checked]:text-rose-foreground"
                  checked={checkedMethod.includes(method.id)}
                  onCheckedChange={() => handleCheckboxChange(method.id)}
                />
                <label
                  htmlFor={method.id}
                  className={cn(
                    "truncate",
                    checkedMethod.includes(method.id)
                      ? "text-websecondary-500 line-through opacity-75"
                      : "text-foreground"
                  )}
                >
                  <h1 className="text-md font-medium">Mark as completed</h1>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeMethods;
