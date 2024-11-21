import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import dynamic from "next/dynamic"; // Import dynamic from next/dynamic
import { FaStar } from "react-icons/fa";
import LoginPopup from "../modals/login-popup";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

// Placeholder component for loading state
const StarRatingSkeleton = () => (
  <div className="flex space-x-2 items-center">
    <div className="animate-pulse">
      <FaStar className="text-gray-300 w-6 h-6" />
    </div>
    <div className="animate-pulse">
      <FaStar className="text-gray-300 w-6 h-6" />
    </div>
    <div className="animate-pulse">
      <FaStar className="text-gray-300 w-6 h-6" />
    </div>
    <div className="animate-pulse">
      <FaStar className="text-gray-300 w-6 h-6" />
    </div>
    <div className="animate-pulse">
      <FaStar className="text-gray-300 w-6 h-6" />
    </div>
  </div>
);

const DynamicStarRatings = dynamic(() => import("react-star-ratings"), {
  ssr: false,
});

interface ReviewsRatingFormProps {
  recipeId: string;
  onReviewAdded: () => void;
}

export const ReviewsRatingForm = ({
  recipeId,
  onReviewAdded,
}: ReviewsRatingFormProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useCurrentUser();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <StarRatingSkeleton />;
  }

  const validateRating = () => {
    if (rating < 1 || rating > 5) {
      setRatingError("Rating must be between 1 and 5.");
      return false;
    }
    setRatingError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowPopup(true);
      return;
    }

    if (!validateRating()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/reviews", {
        recipeId,
        rating,
        review,
      });

      if (response.status === 200) {
        toast.success("Review submitted successfully", {
          position: "top-center",
          autoClose: 5000,
        });
        onReviewAdded();
        setRating(0);
        setReview("");
      } else {
        // Handle error
        if (response.status === 400) {
          toast.error("You have already reviewed on this recipe.", {
            position: "top-center",
            autoClose: 5000,
          });
        } else {
          toast.error("Failed to submit review.", {
            position: "top-center",
            autoClose: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Internal Server Error", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false); // Set submission status to false
    }
  };

  return (
    <div className="w-full flex flex-col justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
      {user ? (
        <div className="space-y-8 mt-2 w-full">
          <DynamicStarRatings
            rating={rating}
            starRatedColor="websecondary"
            starEmptyColor="gray"
            changeRating={(newRating: number) => setRating(newRating)}
            numberOfStars={5}
            starDimension="30px" // Increase star size
            starSpacing="2px"
          />
          {ratingError && <p className="text-red-500">{ratingError}</p>}
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md mt-2"
            rows={4}
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className={`pt-2 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-white rounded-md ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            disabled={isSubmitting} // Disable button while submitting
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </div>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center text-center mt-4">
          <button
            onClick={() => setShowPopup(true)}
            className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-4 py-2 text-white rounded-md"
          >
            Login to Submit Review
          </button>
        </div>
      )}
      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};
