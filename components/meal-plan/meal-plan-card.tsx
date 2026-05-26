import Image from "next/image";
import Link from "next/link";
import { AlarmClock, ArrowUpRight } from "lucide-react";
import { RecipeWithCategory } from "@/types/recipe";
import { formatTime } from "@/lib/formatTime";

interface MealPlanCardProps {
  recipe: RecipeWithCategory;
}

const MealPlanCard = ({ recipe }: MealPlanCardProps) => {
  const recipeHref = recipe.metaSlug
    ? `/${recipe.slug}-${recipe.metaSlug}`
    : `/${recipe.slug}`;
  const totalTime = recipe.recipeCookingTime
    ? recipe.recipeCookingTime.prepTime +
      recipe.recipeCookingTime.cookTime +
      recipe.recipeCookingTime.restTime
    : null;

  return (
    <Link
      href={recipeHref}
      className="group flex min-h-[78px] overflow-hidden rounded-xl border border-[#eee3d5] bg-[#fffdf9] transition hover:border-[#ddc3a7] hover:bg-white hover:shadow-sm"
    >
      <div className="relative w-[76px] shrink-0 overflow-hidden sm:w-[88px]">
        <Image
          className="object-cover transition duration-300 group-hover:scale-105"
          src={recipe.imageUrl || "/assets/images/default-recipe.png"}
          alt={recipe.title || "Recipe"}
          fill
          sizes="(max-width: 640px) 76px, 88px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#2c2118]">
            {recipe.title}
          </h3>
          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-[#9a6b42] transition group-hover:text-primary" />
        </div>
        <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[11px] font-medium text-[#806c5d]">
          {totalTime !== null && (
            <span className="flex shrink-0 items-center gap-1">
              <AlarmClock className="size-3 text-primary" />
              {formatTime(totalTime)}
            </span>
          )}
          {recipe.recipeNutrient?.slice(0, 1).map((nutrient) => (
              <span
                key={nutrient.nutrient.id}
                className="truncate rounded-full bg-[#fff2ec] px-2 py-0.5 text-[#7c4b2b]"
              >
                {nutrient.nutrient.title}
              </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MealPlanCard;
