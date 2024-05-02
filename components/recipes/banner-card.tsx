"use client";

import { cn } from "@/lib/utils";
import Container from "@/components/container";

import guestAuthor from "@/public/assets/images/guest-user.webp";
import RecipeRatingDetails from "@/components/recipes/recipe-rating-details";
import RecipeAuthor from "@/components/recipes/recipe-author";
import RecipeUpdateDetails from "@/components/recipes/recipe-update-details";
import RecipeBreadcum from "@/components/recipes/recipe-breadcum";
import Image from "next/image";
import { RecipeCategories, Recipes } from "@prisma/client";
import { Preview } from "../preview";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
};
interface BannerCardProps {
  recipe: RecipeWithCategory;
  className?: string;
}
const BannerCard = ({ recipe, className }: BannerCardProps) => {
  return (
    <div className={cn("w-full flex items-center", className)}>
      <Container>
        <div className="flex justify-between items-start flex-col lg:flex-row rounded-md">
          <div className="w-full text-start items-start bg-white rounded-md shadow-sm p-4">
            <div className="relative w-full h-full">
              <Image
                src={recipe.imageUrl || "/placeholder.jpg"}
                alt={recipe.title || "Course Image"}
                width={950}
                height={600}
                className="rounded-md"
              />
            </div>
            <RecipeBreadcum currentRecipe={recipe.title} />
            <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center lg:text-left">
              {recipe.title}
            </h1>
            <RecipeAuthor
              authorName="Kyakhayen?"
              authorPhoto={guestAuthor}
              lastUpdateDate="March 25, 2024"
            />

            <div className="mb-4 lg:mb-0 text-center lg:text-left">
              {recipe.RecipeCategories && (
                <span
                  className={cn(
                    "text-white rounded-full p-2 font-normal text-sm",
                    recipe.RecipeCategories.name === "Dinner" && "bg-red-500",
                    recipe.RecipeCategories.name === "Lunch" && "bg-green-500",
                    recipe.RecipeCategories.name === "Breakfast" &&
                      "bg-blue-500",
                    recipe.RecipeCategories.name === "Appetizer" &&
                      "bg-yellow-500",
                    recipe.RecipeCategories.name === "Desert" && "bg-pink-500",
                    recipe.RecipeCategories.name === "Beverage" &&
                      "bg-purple-500"
                  )}
                >
                  {recipe.RecipeCategories?.name}
                </span>
              )}
            </div>
            <RecipeRatingDetails
              rating={4.8}
              reviews={1560}
              totalViewsCount={2365}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BannerCard;
