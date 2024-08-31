"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

import guestAuthor from "@/public/assets/images/guest-user.webp";
import RecipeRatingDetails from "@/components/recipes/recipe-rating-details";
import RecipeAuthor from "@/components/recipes/recipe-author";
import RecipeBreadcum from "@/components/recipes/recipe-breadcum";
import SocialShare from "@/components/social-share";

import { cn } from "@/lib/utils";
import { RecipeCategories, Recipes, Review } from "@prisma/client";
import FavoriteButton from "../favorite-button";
import { useCurrentUser } from "@/hooks/use-current-user";
//import { Queue } from "bullmq";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  Review: Review[] | null;
};
interface BannerCardProps {
  recipe: RecipeWithCategory;
  className?: string;
}
const BannerCard = ({ recipe, className }: BannerCardProps) => {
  const user = useCurrentUser();
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  useEffect(() => {
    if (recipe.Review && recipe.Review.length > 0) {
      const totalRating = recipe.Review.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      setAverageRating(totalRating / recipe.Review.length);
      setReviewsCount(recipe.Review.length);
    }
    const userView = async () => {
      try {
        await axios.post("/api/add-view", { recipeId: recipe.id });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };
    userView();
  }, [recipe.Review, recipe.id]);
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
  }, [recipe.id]); // Only re-run the effect if recipe.id changes

  // Assuming setUserFavoriteRecipeIds and setIsFavorited are set up with useState elsewhere

  const recipeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipe.slug}`;

  return (
    <div className={cn("w-full flex items-center", className)}>
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
            <FavoriteButton
              recipeId={recipe.id}
              classNames="absolute top-0 right-4 z-10"
              initialIsFavorited={isFavorited}
            />
          </div>

          <RecipeBreadcum currentRecipe={recipe.title} />
          <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center lg:text-left">
            {recipe.title}
          </h1>
          <RecipeAuthor
            authorName="Kyakhayen?"
            authorPhoto={guestAuthor}
            lastUpdateDate={recipe.updatedAt}
          />

          <div className="mb-4 lg:mb-0 text-center lg:text-left">
            {recipe.RecipeCategories && (
              <span
                className={cn(
                  "text-white rounded-full p-1 px-2 font-normal text-sm",
                  recipe.RecipeCategories.name === "Non Veg" && "bg-red-500",
                  recipe.RecipeCategories.name === "Veg" && "bg-green-500",
                  recipe.RecipeCategories.name === "Egg" && "bg-yellow-500",
                  recipe.RecipeCategories.name === "Vegan" && "bg-pink-500",
                  recipe.RecipeCategories.name === "Pescetarian" &&
                    "bg-purple-500"
                )}
              >
                {recipe.RecipeCategories?.name}
              </span>
            )}
          </div>
          <RecipeRatingDetails
            rating={averageRating}
            reviews={reviewsCount}
            totalViewsCount={recipe.views}
          />
          <div className="mt-4 flex flex-col items-center lg:items-start">
            <h3 className="text-xl font-bold">Share this recipe</h3>
            <SocialShare
              url={recipeUrl}
              title={recipe.title}
              description={recipe.description!}
              imageUrl={recipe.imageUrl!}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;
