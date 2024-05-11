"use client";

import { RecipeHealthBenefits as RecipeBenefitType } from "@prisma/client";

interface RecipeHealthBenefitsProps {
  recipeHealthBenefits: RecipeBenefitType[];
}

const RecipeHealthBenefits = ({
  recipeHealthBenefits,
}: RecipeHealthBenefitsProps) => {
  return (
    <div className="w-full">
      {recipeHealthBenefits.length === 0 ? (
        <p className="text-sm font-medium text-center text-websecondary-500">
          No health benefits available for this recipe.
        </p>
      ) : (
        <ul>
          {recipeHealthBenefits.map((benefit, index) => (
            <li key={benefit.id} className="flex flex-col py-2">
              <div className="flex items-center">
                <div className="flex items-center mb-3">
                  <span className="text-lg font-semibold bg-websecondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                </div>
                <div className="flex items-center mb-3">
                  <p className="text-md font-normal">{benefit.title}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeHealthBenefits;
