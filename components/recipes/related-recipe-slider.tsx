"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import RecipeCard from "@/components/recipes/recipe-card";

import { RecipeWithCategory } from "@/types/recipe";
import { handleRecipeClick } from "@/lib/handle-recipe-click";
import { useEffect, useState } from "react";
import { getRelatedRecipes } from "@/actions/get-related-recipe";
import { useCurrentUser } from "@/hooks/use-current-user";
import Loader from "@/components/loader";

interface RelatedCourseProps {
  recipeId: string;
}

const RelatedRecipeSlider = ({ recipeId }: RelatedCourseProps) => {
  const user = useCurrentUser();
  const userId = user?.id;

  const [relatedRecipes, setRelatedRecipes] = useState<RecipeWithCategory[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRelatedRecipes = async () => {
      try {
        const behaviorData = JSON.parse(
          localStorage.getItem("behaviorData") || "{}"
        );
        const categoryData = JSON.parse(
          localStorage.getItem("categoryData") || "{}"
        );

        const response = await getRelatedRecipes({
          recipeId,
          userId,
          behaviorData,
          categoryData,
        });
        setRelatedRecipes(response);
      } catch (error) {
        console.error("Failed to fetch related recipes:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched or an error occurs
      }
    };
    fetchRelatedRecipes();
  }, [recipeId]);

  return (
    <div className=" w-full mt-8 ">
      <div className="bg-white p-4 rounded-md shadow-sm transition">
        <h2 className="text-2xl font-bold mb-4">Related Recipes For You</h2>
      </div>

      <div className="w-full mt-5  p-4 rounded-md shadow-sm transition">
        {loading && <Loader />}
        {relatedRecipes.length > 0 && !loading && (
          <>
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full "
            >
              <CarouselContent>
                {relatedRecipes.map((recipe, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 md:basis-1/2 lg:basis-1/4"
                  >
                    <div
                      className="p-1"
                      onClick={() =>
                        handleRecipeClick(
                          recipe.id,
                          recipe.RecipeCategories!.id
                        )
                      }
                    >
                      <RecipeCard recipe={recipe} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute top-1/2 transform -translate-y-1/2 left-2 cursor-pointer" />
              <CarouselNext className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer" />
            </Carousel>
          </>
        )}
      </div>

      {!loading && relatedRecipes.length === 0 && (
        <div className="bg-white p-4 rounded-md shadow-sm transition">
          <h2 className="text-2xl font-bold mb-4">No Related Recipes</h2>
        </div>
      )}
    </div>
  );
};

export default RelatedRecipeSlider;
