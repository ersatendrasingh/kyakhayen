"use client";

import Link from "next/link";
import { Button } from "../ui/button";

interface NoRecipesFoundProps {
  key: string;
}

export const NoRecipesFound = ({ key }: NoRecipesFoundProps) => {
  return (
    <div className="flex justify-center items-center h-[400px]">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">No Recipe Found</h2>
        <p className="text-gray-600 mb-4">
          Sorry, there are no recipes available for this category.
        </p>
        <Link href={`/recipes`}>
          <Button variant="link">View All Recipes</Button>
        </Link>
      </div>
    </div>
  );
};
