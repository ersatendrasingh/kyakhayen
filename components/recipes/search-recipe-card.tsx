"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlarmClock } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/formatTime";
import { RecipeWithCategory } from "@/types/recipe";

interface SearchRecipeCardProps {
  recipe: RecipeWithCategory;
}

const SearchRecipeCard = ({ recipe }: SearchRecipeCardProps) => {
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
        <div className="h-full flex">
          {/* Left side: Image */}
          <div className="w-2/5 relative">
            <div className="w-full h-0 pb-full rounded-md overflow-hidden">
              <Image
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={recipe.imageUrl || "https://via.placeholder.com/300x200"}
                alt={recipe.title || "Recipe Image"}
                layout="fill"
              />
            </div>
          </div>
          {/* Right side: Recipe details */}
          <div className="w-3/5 px-4 py-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start mb-2"></div>
              <div className="font-bold text-xl mb-2">{recipe.title}</div>
            </div>
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
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SearchRecipeCard;
