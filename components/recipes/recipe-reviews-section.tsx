"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { ReviewsRatingForm } from "@/components/reviews/reviews-rating-form";
import ReviewsRatingList from "@/components/reviews/reviews-rating-list";
import { ReviewWithRelations } from "@/types/review";
import { useCurrentUser } from "@/hooks/use-current-user";

interface RecipeReviewsSectionProps {
  recipeId: string;
  reviews?: ReviewWithRelations[];
}

const RecipeReviewsSection = ({
  recipeId,
  reviews,
}: RecipeReviewsSectionProps) => {
  const [reviewsList, setReviewsList] = useState<ReviewWithRelations[]>(
    reviews || []
  );
  const [showReviewForm, setShowReviewForm] = useState(true);
  const user = useCurrentUser();

  useEffect(() => {
    if (user) {
      const userHasReviewed = reviewsList.some(
        (review) => review.userId === user.id
      );
      setShowReviewForm(!userHasReviewed);
    }
  }, [user, reviewsList]);

  const handleReviewAdded = async () => {
    try {
      const response = await axios.get(`/api/reviews/${recipeId}`);
      setReviewsList(response.data);
      setShowReviewForm(false);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const handleReviewDeleted = async () => {
    try {
      const response = await axios.get(`/api/reviews/${recipeId}`);
      setReviewsList(response.data);
      const userHasReviewed = response.data.some(
        (review: ReviewWithRelations) => review.userId === user?.id
      );
      setShowReviewForm(!userHasReviewed);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  return (
    <div>
      {showReviewForm && (
        <ReviewsRatingForm
          recipeId={recipeId}
          onReviewAdded={handleReviewAdded}
        />
      )}
      <ReviewsRatingList
        recipeId={recipeId}
        reviews={reviewsList}
        onReviewAdded={handleReviewDeleted}
      />
    </div>
  );
};

export default RecipeReviewsSection;
