"use client";

import axios from "axios";
import { useState } from "react";

import { CommentsForm } from "@/components/comments/comments-form";
import CommentsList from "@/components/comments/comments-list";
import { CommentWithRelations } from "@/types/comment";
import { RecipeWithCategory } from "@/types/recipe";
import SocialShare from "../social-share";

interface RecipeShareSectionProps {
  recipe: RecipeWithCategory;
}

const RecipeShareSection = ({ recipe }: RecipeShareSectionProps) => {
  const recipeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipe.slug}`;
  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Share this recipe</h1>
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
