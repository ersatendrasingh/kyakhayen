"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import RecipeCard from "@/components/recipes/recipe-card";
import Container from "@/components/container";
import {
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  Recipes,
} from "@prisma/client";
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

interface RelatedCourseProps {
  relatedRecipes: RecipeWithCategory[];
}

const RelatedRecipeSlider = ({ relatedRecipes }: RelatedCourseProps) => {
  return (
    <div className="w-full mt-8 ">
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
                className="pl-1 md:basis-1/2 lg:basis-1/3"
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
    </div>
  );
};

export default RelatedRecipeSlider;
