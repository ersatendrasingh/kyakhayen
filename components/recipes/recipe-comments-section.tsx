"use client";

import axios from "axios";
import { useState } from "react";

import { CommentsForm } from "@/components/comments/comments-form";
import CommentsList from "@/components/comments/comments-list";
import { CommentWithRelations } from "@/types/comment";

interface RecipeCommentSectionProps {
  recipeId: string;
  comments?: CommentWithRelations[];
}

const RecipeCommentSection = ({
  recipeId,
  comments,
}: RecipeCommentSectionProps) => {
  const [commentsList, setCommentsList] = useState<CommentWithRelations[]>(
    comments || []
  );

  const handleCommentAdded = async () => {
    try {
      const response = await axios.get(`/api/comments/${recipeId}`);

      setCommentsList(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  return (
    <div>
      <CommentsForm recipeId={recipeId} onCommentAdded={handleCommentAdded} />
      <CommentsList
        recipeId={recipeId}
        comments={commentsList}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default RecipeCommentSection;
