"use client";
import axios from "axios";
import { useEffect, useState } from "react";

import { CommentsForm } from "@/components/comments/comments-form";
import CommentsList from "@/components/comments/comments-list";
import { Comment } from "@/types/comment";

interface RecipeCommentSectionProps {
  recipeId: string;
}

const RecipeCommentSection = ({ recipeId }: RecipeCommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedPhoneNumber = localStorage.getItem("userPhoneNumber") || "";
    setEmail(storedEmail);
    setPhoneNumber(storedPhoneNumber);
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/comments/${recipeId}`, {
          params: { email, phoneNumber },
        });
        setComments(response.data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch comments when both email and phoneNumber are set
    if (email && phoneNumber) {
      fetchComments();
    }
  }, [recipeId, email, phoneNumber]);

  const handleCommentAdded = async () => {
    try {
      const response = await axios.get(`/api/comments/${recipeId}`, {
        params: { email, phoneNumber },
      });
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
        <div className="flex justify-between w-full border-b-2 border-gray-200  mb-4">
          <h1 className="text-xl font-bold text-gray-800  mb-4">
            Questions & Replies
          </h1>
        </div>
        <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 mb-2">
          {/* Loading skeleton */}
          <div className="flex flex-row items-start justify-start w-full my-5">
            <div className="w-14 h-14 rounded-full bg-gray-200 mr-2"></div>
            <div className="flex flex-col w-full">
              <div className="w-96 h-5 rounded-md bg-gray-200 mb-1"></div>
              <div className="w-full h-8 rounded-md bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-row items-start justify-start w-full my-5">
            <div className="w-14 h-14 rounded-full bg-gray-200 mr-2"></div>
            <div className="flex flex-col w-full">
              <div className="w-96 h-5 rounded-md bg-gray-200 mb-1"></div>
              <div className="w-full h-8 rounded-md bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-row items-start justify-start w-full my-5">
            <div className="w-14 h-14 rounded-full bg-gray-200 mr-2"></div>
            <div className="flex flex-col w-full">
              <div className="w-96 h-5 rounded-md bg-gray-200 mb-1"></div>
              <div className="w-full h-8 rounded-md bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-row items-start justify-start w-full my-5">
            <div className="w-14 h-14 rounded-full bg-gray-200 mr-2"></div>
            <div className="flex flex-col w-full">
              <div className="w-96 h-5 rounded-md bg-gray-200 mb-1"></div>
              <div className="w-full h-8 rounded-md bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CommentsForm recipeId={recipeId} onCommentAdded={handleCommentAdded} />
      <CommentsList
        recipeId={recipeId}
        comments={comments}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default RecipeCommentSection;
