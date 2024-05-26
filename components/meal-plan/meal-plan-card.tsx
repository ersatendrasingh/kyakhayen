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
    <div className="w-full flex items-center justify-between p-4 bg-white rounded-md shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="flex flex-col flex-grow">
        <Link href={`/recipes/${recipe.slug}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="text-lg font-bold">{recipe.title}</div>
              {recipe.RecipeCategories && (
                <div
                  className={cn(
                    "ml-4 px-2 py-1 rounded-md text-xs font-semibold text-white",
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
            <div className="flex items-center mb-2">
              {recipe.recipeDifficulty && (
                <div
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold mr-2 text-white",
                    recipe.recipeDifficulty.title === "Beginner" &&
                      "bg-blue-500",
                    recipe.recipeDifficulty.title === "Intermediate" &&
                      "bg-green-500",
                    recipe.recipeDifficulty.title === "Advanced" && "bg-red-500"
                  )}
                >
                  {recipe.recipeDifficulty.title}
                </div>
              )}
              {recipe.recipeDietType &&
                recipe.recipeDietType.map((dietType) => (
                  <div
                    key={dietType.id}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-semibold mr-2 text-white",
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
      <div className="ml-4">
        <Image
          className="rounded-md"
          src={recipe.imageUrl || "https://via.placeholder.com/200x200"}
          alt={recipe.title || "Recipe Image"}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
};

export default MealPlanCard;
