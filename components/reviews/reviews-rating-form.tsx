"use client";

import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import LoginPopup from "@/components/modals/login-popup";
import StarRating from "@/components/reviews/star-rating";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ReviewsRatingFormProps {
  recipeId: string;
  onReviewAdded: () => void;
}

export const ReviewsRatingForm = ({
  recipeId,
  onReviewAdded,
}: ReviewsRatingFormProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useCurrentUser();

  const handleSubmit = async () => {
    if (!user) {
      setShowPopup(true);
      return;
    }
    if (rating < 1 || rating > 5) {
      setRatingError("Choose a rating before sharing your review.");
      return;
    }

    setRatingError(null);
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/reviews", {
        recipeId,
        rating,
        review,
      });
      if (response.status === 200) {
        toast.success("Your review has been shared.");
        onReviewAdded();
        setRating(0);
        setReview("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("We could not save your review right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[1.35rem] border border-[#eee1cf] bg-[#fcf7ed] p-5 dark:border-white/8 dark:bg-[#162e27]">
      <h3 className="text-base font-semibold text-[#322820] dark:text-[#eef2ed]">
        Tried this recipe?
      </h3>
      <p className="mt-1 text-sm leading-6 text-[#75665a] dark:text-[#a7b5af]">
        Rate the taste and tell others what worked for you.
      </p>
      {user ? (
        <div className="mt-5 space-y-4">
          <StarRating value={rating} onChange={setRating} size={28} />
          {ratingError && <p className="text-xs text-[#b83324]">{ratingError}</p>}
          <textarea
            className="min-h-28 w-full resize-none rounded-xl border border-[#e3d2b7] bg-[#fffdf8] p-3 text-sm text-[#332820] outline-none transition focus:border-[#bd8b40] dark:border-white/10 dark:bg-[#11251f] dark:text-[#edf2ec]"
            placeholder="How was the flavour, texture or preparation?"
            value={review}
            onChange={(event) => setReview(event.target.value)}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#b83324] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9c2d21] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            Share review
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="mt-5 cursor-pointer rounded-full bg-[#b83324] px-5 py-3 text-sm font-semibold text-white"
        >
          Log in to review
        </button>
      )}
      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};
