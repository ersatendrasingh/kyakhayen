import Image from "next/image";
import Link from "next/link";
import { AlarmClock } from "lucide-react";
import { RecipeWithCategory } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/formatTime";

interface MealPlanCardProps {
  recipe: RecipeWithCategory;
}

const MealPlanCard = ({ recipe }: MealPlanCardProps) => {
  return (
    <div className="w-full flex flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="flex flex-col flex-grow">
        <Link href={`/recipes/${recipe.slug}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="text-lg font-bold">{recipe.title}</div>
            </div>
            <div className="flex items-center mb-2"></div>
            <div className="text-sm text-gray-700 mb-2">
              {recipe.recipeNutrient && recipe.recipeNutrient.length > 0 && (
                <>
                  {recipe.recipeNutrient.map((nutrient, index) => (
                    <span key={nutrient.nutrient.id} className="text-sm">
                      {nutrient.nutrient.title}
                      {index < recipe.recipeNutrient!.length - 1 && ", "}
                    </span>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center">
              {recipe.recipeCookingTime && (
                <>
                  <AlarmClock className="w-5 h-5 pr-1 text-websecondary" />
                  {formatTime(
                    recipe.recipeCookingTime.prepTime +
                      recipe.recipeCookingTime.cookTime +
                      recipe.recipeCookingTime.restTime
                  )}
                </>
              )}
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
        <div className="relative w-24 h-24 md:w-36 md:h-36">
          <Image
            className="rounded-md object-cover"
            src={recipe.imageUrl || "/assets/images/default-recipe.jpg"}
            alt={recipe.title || "Recipe Image"}
            fill
          />
        </div>
      </div>
    </div>
  );
};

export default MealPlanCard;
