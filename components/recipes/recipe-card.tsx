"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RecipeCategories, Recipes } from "@prisma/client";
import { cn } from "@/lib/utils";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
};

interface RecipeCardProps {
  recipe: RecipeWithCategory;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    setIsInView(inView);
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`max-w-sm rounded-md overflow-hidden shadow-lg transform transition-transform hover:shadow-xl hover:-translate-y-1 ${
        isInView ? "animate-slide-up" : ""
      }`}
    >
      <Link href={`/recipes/${recipe.slug}`}>
        <div className="h-full flex flex-col">
          <div className="relative">
            <Image
              className="w-full"
              src={recipe.imageUrl || "https://via.placeholder.com/300x200"}
              alt={recipe.title || "Recipe Image"}
              width={300}
              height={200}
            />
            {recipe.RecipeCategories && (
              <div
                className={cn(
                  "absolute top-0 right-0 bg-webprimary text-white px-2 py-1 rounded-tr-md rounded-bl-md text-xs font-semibold",
                  recipe.RecipeCategories.name === "Dinner" && "bg-red-500",
                  recipe.RecipeCategories.name === "Lunch" && "bg-green-500",
                  recipe.RecipeCategories.name === "Breakfast" && "bg-blue-500",
                  recipe.RecipeCategories.name === "Appetizer" &&
                    "bg-yellow-500",
                  recipe.RecipeCategories.name === "Desert" && "bg-pink-500",
                  recipe.RecipeCategories.name === "Beverage" && "bg-purple-500"
                )}
              >
                {recipe.RecipeCategories.name}
              </div>
            )}
          </div>
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{recipe.title}</div>
            <p className="text-gray-700 text-base mb-2">Author: {"Unknown"}</p>
            <p className="text-gray-700 text-base mb-2">Recipe Time: {"N/A"}</p>
            {/* Add any other relevant details here */}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
