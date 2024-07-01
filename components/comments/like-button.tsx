"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

import { useCurrentUser } from "@/hooks/use-current-user";
import LoginPopup from "@/components/modals/login-popup";

interface LikeButtonProps {
  commentId: string;
  postId: string;
  initialLikes?: number | null;
}

const LikeButton = ({ commentId, postId, initialLikes }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await axios.get(
          `/api/comments/${postId}/${commentId}/like-status`
        );
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    fetchLikeStatus();
  }, [commentId, postId]);

  const handleLike = async () => {
    if (!user) {
      setShowPopup(true);
      return;
    }
    const previousLikes = likes;
    const previousIsLiked = isLiked;

    if (isLiked) {
      // Optimistically update UI
      setLikes(likes - 1);
      setIsLiked(false);
      try {
        // Unlike the comment
        await axios.delete(`/api/comments/${postId}/${commentId}/unlike`);
      } catch (error) {
        // Revert UI update if API call fails
        setLikes(previousLikes);
        setIsLiked(previousIsLiked);
        console.error("Error unliking comment:", error);
      }
    } else {
      // Optimistically update UI
      setLikes(likes + 1);
      setIsLiked(true);
      try {
        // Like the comment
        await axios.post(`/api/comments/${postId}/${commentId}/like`);
      } catch (error) {
        // Revert UI update if API call fails
        setLikes(previousLikes);
        setIsLiked(previousIsLiked);
        console.error("Error liking comment:", error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleLike} disabled={false}>
        <FaHeart className="w-4 h-4 mr-2" color={isLiked ? "red" : "gray"} />
      </button>
      <span className="text-md font-bold">{likes}</span>
      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default LikeButton;
