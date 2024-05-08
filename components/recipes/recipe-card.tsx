"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  Recipes,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import { AlarmClock } from "lucide-react";
import { formatTime } from "@/lib/formatTime";

type RecipeDietType = {
  id: string;
  recipeId: string;
  dietTypeId: string;
  dietType: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
  };
};

type RecipeNutrient = {
  id: string;
  recipeId: string;
  nutrientId: string;
  nutrient: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
  };
};

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeCookingTime: RecipeCookingTime | null;
  recipeDifficulty: RecipeDifficulty | null;
  recipeDietType: RecipeDietType[] | null;
  recipeNutrient: RecipeNutrient[] | null;
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
      className={`max-w-sm min-h-[348px] rounded-md overflow-hidden shadow-lg transform transition-transform hover:shadow-xl hover:-translate-y-1 ${
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
                  recipe.RecipeCategories.name === "Non Veg" && "bg-red-500",
                  recipe.RecipeCategories.name === "Veg" && "bg-green-500",
                  recipe.RecipeCategories.name === "Pescetarian" &&
                    "bg-blue-500",
                  recipe.RecipeCategories.name === "Egg" && "bg-yellow-500",
                  recipe.RecipeCategories.name === "Vegan" && "bg-pink-500"
                )}
              >
                {recipe.RecipeCategories.name}
              </div>
            )}
          </div>
          <div className="px-3 py-4">
            <div className="flex items-start mb-2">
              {recipe.recipeDifficultyId && (
                <div
                  className={cn(
                    "bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold mr-2"
                  )}
                >
                  {recipe.recipeDifficulty && recipe.recipeDifficulty.title}
                </div>
              )}
              {recipe.recipeDietType &&
                recipe.recipeDietType.map((dietType) => (
                  <div
                    key={dietType.id}
                    className={cn(
                      "bg-webprimary text-white px-2 py-1 rounded-md text-xs font-semibold",
                      dietType.dietType.title === "Gym" && "bg-red-500",
                      dietType.dietType.title === "Detox" && "bg-green-500",
                      dietType.dietType.title === "Keto" && "bg-blue-500",
                      dietType.dietType.title === "Gluten Free" &&
                        "bg-yellow-500",
                      dietType.dietType.title === "Vegan" && "bg-pink-500",
                      dietType.dietType.title === "Mediterranean" &&
                        "bg-purple-500",
                      dietType.dietType.title === "Lactose Free" &&
                        "bg-orange-500"
                    )}
                  >
                    {dietType.dietType.title}
                  </div>
                ))}
            </div>
            <div className="font-bold text-xl mb-2">{recipe.title}</div>
            <p className="text-gray-700 text-base mb-2">
              {recipe.recipeNutrient && recipe.recipeNutrient.length > 0 && (
                <>
                  {recipe.recipeNutrient.map((nutrient, index) => (
                    <span
                      key={nutrient.nutrient.id}
                      className="text-sm text-foreground"
                    >
                      {nutrient.nutrient.title}
                      {index < recipe.recipeNutrient!.length - 1 && ", "}
                    </span>
                  ))}
                </>
              )}
            </p>
            <div className="flex items-center">
              {recipe.recipeCookingTime && (
                <>
                  <AlarmClock className="w-6 h-6 pr-2 text-websecondary" />
                  {formatTime(
                    recipe.recipeCookingTime.prepTime +
                      recipe.recipeCookingTime.cookTime +
                      recipe.recipeCookingTime.restTime
                  )}
                </>
              )}
            </div>

            {/* Add any other relevant details here */}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
