"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import CourseDetails from "@/components/courses/course-details";
import { RecipeCategories, Recipes } from "@prisma/client";
import Container from "@/components/container";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
};

interface RecipePageProps {
  recipe: RecipeWithCategory;
  className?: string;
}

const RecipePage = ({ recipe, className }: RecipePageProps) => {
  return (
    <div
      className={cn(
        "w-full flex items-start justify-between text-start bg-gray-100",
        className
      )}
    >
      <Container>
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
        </div>
        {/* <RecipeDetails recipe={recipe} /> */}
      </Container>
    </div>
  );
};

export default RecipePage;
