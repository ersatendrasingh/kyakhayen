import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSave, FaStar, FaTimes } from "react-icons/fa";
import {
  AlarmClock,
  EllipsisVertical,
  SquarePen,
  Trash,
  Loader2,
} from "lucide-react";
import Linkify from "react-linkify";
import axios from "axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/comment-time";
import { ReviewWithRelations } from "@/types/review";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentDeleteConfirmModal } from "@/components/modals/comment-delete-confirm-modal";
import { useCurrentUser } from "@/hooks/use-current-user";
import dynamic from "next/dynamic";

interface ReviewsRatingListProps {
  recipeId: string;
  reviews: ReviewWithRelations[];
  onReviewAdded: () => void;
}

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
  loading: () => <StarRatingSkeleton />,
});

const ReviewsRatingList = ({
  recipeId,
  reviews,
  onReviewAdded,
}: ReviewsRatingListProps) => {
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // State for edit functionality
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editContent, setEditContent] = useState<string>("");

  const user = useCurrentUser();

  useEffect(() => {
    fetchUserAvatars(reviews);
  }, [reviews]);

  const fetchUserAvatars = async (reviews: ReviewWithRelations[]) => {
    const userIds: string[] = reviews
      .filter((review) => review.userId)
      .map((review) => review.userId!);

    try {
      const avatarRequests = userIds.map(async (userId) => {
        const response = await axios.get(`/api/user/${userId}`);
        setUserAvatars((prevAvatars) => ({
          ...prevAvatars,
          [userId]: response.data.image,
        }));
      });

      await Promise.all(avatarRequests);
    } catch (error) {
      console.error("Failed to fetch user avatars:", error);
    }
  };

  const renderReviews = (reviews: ReviewWithRelations[]) => {
    const defaultUserImageUrl = "/assets/images/guest-user.webp";

    return reviews.map((review) => (
      <div
        key={review.id}
        className={`w-full flex flex-col items-start justify-start bg-white rounded-md p-4 mb-2 relative`}
      >
        <div className={cn("flex flex-row items-start justify-start w-full")}>
          <Image
            src={
              review.userId
                ? userAvatars[review.userId] || defaultUserImageUrl
                : defaultUserImageUrl
            }
            alt="User Profile"
            width={40}
            height={40}
            className={cn(
              "w-10 h-10 rounded-full border-2 mr-2",
              review.userId && "border-websecondary"
            )}
          />
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-1 ">
              <div className="flex flex-col">
                <span className="font-bold">{review.user?.name}</span>
                <div className="flex items-center">
                  <AlarmClock className="w-6 h-6 pr-2" />
                  <span className="text-gray-500 text-sm">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
                <div className="mt-1">
                  {editingReviewId === review.id ? (
                    <DynamicStarRatings
                      rating={editRating}
                      starRatedColor="red"
                      starEmptyColor="gray"
                      changeRating={(newRating) => setEditRating(newRating)}
                      numberOfStars={5}
                      starDimension="20px"
                      starSpacing="1px"
                    />
                  ) : (
                    <DynamicStarRatings
                      rating={review.rating}
                      starRatedColor="red"
                      starEmptyColor="gray"
                      numberOfStars={5}
                      starDimension="20px"
                      starSpacing="1px"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center mt-1 md:-mt-5 md:ml-3 "></div>
            </div>

            {editingReviewId === review.id ? (
              <div className="flex flex-col">
                <textarea
                  className="border rounded-md p-2 w-full resize-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex items-center mt-2 ">
                  <button
                    onClick={() =>
                      handleSaveEdit(review.id, editContent, editRating)
                    }
                    className="text-green-500 hover:text-green-700 focus:outline-none ml-2"
                    title="Save"
                  >
                    <FaSave className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                    title="Cancel editing"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a
                    href={decoratedHref}
                    key={key}
                    className="text-red-600 hover:text-webprimary underline"
                  >
                    {decoratedText}
                  </a>
                )}
              >
                <div>{review.comment}</div>
              </Linkify>
            )}

            {review.isPublished ? null : (
              <p className="text-sm text-gray-500 mt-2">
                This review is awaiting review and is only visible to you.
              </p>
            )}
          </div>
          {(review.userId === user?.id || user?.role === "ADMIN") &&
            deletingId !== review.id &&
            editingReviewId !== review.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <EllipsisVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleEdit(review.id)}
                    className="cursor-pointer text-xs font-medium text-gray-700"
                  >
                    <SquarePen className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setReviewToDelete(review.id);
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer text-xs font-medium text-gray-700"
                  >
                    <Trash className="w-3 h-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          {deletingId === review.id && (
            <div className="ml-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
    ));
  };

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const response = await axios.delete(
        `/api/reviews/${recipeId}/${reviewId}`
      );
      if (response.status === 200) {
        toast.success("Review deleted successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        onReviewAdded();
      } else {
        toast.error("Failed to delete review.", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Internal server error. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setDeletingId(null);
      setIsModalOpen(false);
    }
  };

  const handleEdit = (reviewId: string) => {
    const reviewToEdit = reviews.find((review) => review.id === reviewId);
    if (reviewToEdit) {
      setEditingReviewId(reviewId);
      setEditContent(reviewToEdit.comment);
      setEditRating(reviewToEdit.rating);
    }
  };

  const handleSaveEdit = async (
    reviewId: string,
    editedContent: string,
    editedRating: number
  ) => {
    try {
      const response = await axios.put(`/api/reviews/${recipeId}/${reviewId}`, {
        content: editedContent,
        rating: editedRating,
      });
      if (response.status === 200) {
        toast.success("Review updated successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        // Refresh reviews list or update locally
        setEditingReviewId(null);
        setEditContent("");
        setEditRating(0);
        onReviewAdded();
      } else {
        toast.error("Failed to update review.", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Internal server error. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent("");
    setEditRating(0);
  };

  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <div className="flex justify-between w-full border-b-2 border-gray-200 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">User Reviews</h1>
        {reviews.length > 0 && (
          <p className="text-right font-bold text-websecondary text-xl">
            Reviews: ({reviews.length})
          </p>
        )}
      </div>
      {reviews.length === 0 && (
        <p className="text-gray-500 text-sm">
          No reviews yet. Be the first to review this recipe!
        </p>
      )}
      {renderReviews(reviews)}
      {isModalOpen && (
        <CommentDeleteConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => reviewToDelete && handleDelete(reviewToDelete)}
        />
      )}
    </div>
  );
};

export default ReviewsRatingList;
