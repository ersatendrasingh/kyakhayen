"use client";

import { RecipeWithCategory } from "@/types/recipe";
import SocialShare from "@/components/social-share";

interface RecipeShareSectionProps {
  recipe: RecipeWithCategory;
}

const RecipeShareSection = ({ recipe }: RecipeShareSectionProps) => {
  const canonicalSlug = recipe.metaSlug
    ? `${recipe.slug}-${recipe.metaSlug}`
    : recipe.slug;
  const recipeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${canonicalSlug}`;
  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h2 className="text-2xl font-bold">Share this recipe</h2>
      <SocialShare
        url={recipeUrl}
        title={recipe.title}
        description={recipe.description!}
        imageUrl={recipe.imageUrl!}
      />
    </div>
  );
};

export default RecipeShareSection;
