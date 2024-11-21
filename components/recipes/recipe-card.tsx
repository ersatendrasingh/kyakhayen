"use client";

import axios from "axios";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlarmClock } from "lucide-react";

import FavoriteButton from "@/components/favorite-button";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/formatTime";
import { RecipeWithCategory } from "@/types/recipe";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleRecipeClick } from "@/lib/handle-recipe-click";

interface RecipeCardProps {
  recipe: RecipeWithCategory;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const user = useCurrentUser();

  const [isInView, setIsInView] = useState(false);

  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  useEffect(() => {
    const fetchUserFavoriteRecipeIds = async () => {
      try {
        const response = await axios.get(`/api/user/${user?.id}/favorites`);

        const favoriteRecipeIds = response.data.map(
          (favorite: any) => favorite.recipe.id
        );
        setIsFavorited(favoriteRecipeIds.includes(recipe.id));
      } catch (error) {
        console.error("Error fetching user favorites:", error);
      }
    };
    if (user) fetchUserFavoriteRecipeIds();
  }, [recipe.id]);

  useEffect(() => {
    setIsInView(inView);
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`max-w-sm min-h-[348px] bg-white rounded-md overflow-hidden shadow-lg transform transition-transform hover:shadow-xl hover:-translate-y-1 ${
        isInView ? "animate-slide-up" : ""
      }`}
      onClick={() => handleRecipeClick(recipe.id, recipe.RecipeCategories!.id)}
    >
      <div className="h-full flex flex-col relative">
        {/* FavoriteButton component */}
        <div className="absolute top-0 right-3 z-10">
          <FavoriteButton
            recipeId={recipe.id}
            initialIsFavorited={isFavorited}
            classNames="cursor-pointer"
          />
        </div>
        <div className="relative">
          <Link href={`/${recipe.slug}`}>
            <Image
              className="w-full"
              src={recipe.imageUrl || "/meta-images/recipe-page.jpg"}
              alt={recipe.title || "Recipe Image"}
              width={300}
              height={200}
            />
          </Link>
          {recipe.RecipeCategories && (
            <div
              className={cn(
                "absolute top-0 left-0 bg-webprimary text-white px-2 py-1 rounded-tl-md rounded-br-md text-xs font-semibold",
                recipe.RecipeCategories.name === "Non Veg" && "bg-red-500",
                recipe.RecipeCategories.name === "Veg" && "bg-green-500",
                recipe.RecipeCategories.name === "Pescetarian" && "bg-blue-500",
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
                  "bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold mr-2",
                  recipe.recipeDifficulty?.title === "Beginner" &&
                    "bg-blue-500",
                  recipe.recipeDifficulty?.title === "Intermediate" &&
                    "bg-green-500",
                  recipe.recipeDifficulty?.title === "Advanced" && "bg-red-500"
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
          <Link href={`/${recipe.slug}`}>
            <div className="font-bold text-xl mb-2">{recipe.title}</div>
          </Link>
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
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
