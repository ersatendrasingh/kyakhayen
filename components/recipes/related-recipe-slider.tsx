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

interface RelatedCourseProps {
  relatedRecipes: RecipeWithCategory[];
}

const RelatedRecipeSlider = ({ relatedRecipes }: RelatedCourseProps) => {
  return (
    <div className="w-full mt-8 ">
      {relatedRecipes.length > 0 && (
        <>
          <div className="bg-white p-4 rounded-md shadow-sm transition">
            <h2 className="text-2xl font-bold mb-4">Related Recipes For You</h2>
          </div>
          <div className="w-full mt-5 relative">
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
                    <div className="p-1">
                      <RecipeCard recipe={recipe} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute top-1/2 transform -translate-y-1/2 left-2 cursor-pointer" />
              <CarouselNext className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer" />
            </Carousel>
          </div>
        </>
      )}
      {relatedRecipes.length === 0 && (
        <div className="bg-white p-4 rounded-md shadow-sm transition">
          <h2 className="text-2xl font-bold mb-4">No Related Recipes</h2>
        </div>
      )}
    </div>
  );
};

export default RelatedRecipeSlider;
