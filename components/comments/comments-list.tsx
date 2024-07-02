"use client";

import { useState, useEffect } from "react";

import { FaReply, FaSave, FaTimes } from "react-icons/fa"; // Import save and cancel icons
import { Button } from "@/components/ui/button";
import { CommentsForm } from "@/components/comments/comments-form";
import axios from "axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/comment-time";
import { Comment } from "@/types/comment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, SquarePen, Trash } from "lucide-react";
import { toast } from "react-toastify";

import { Loader2 } from "lucide-react"; // Assuming Loader2 is from lucide-react
import { CommentDeleteConfirmModal } from "../modals/comment-delete-confirm-modal";
import LikeButton from "./like-button";

interface CommentsListProps {
  recipeId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

const CommentsList = ({
  recipeId,
  comments,
  onCommentAdded,
}: CommentsListProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State for edit functionality
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    fetchUserAvatars(comments);
  }, [comments]);

  const fetchUserAvatars = async (comments: Comment[]) => {
    const userIds: string[] = comments
      .filter((comment) => comment.userId)
      .map((comment) => comment.userId!);

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

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);
  };

  const handleCommentAddedAndReset = () => {
    onCommentAdded();
    setReplyingTo(null); // Reset replyingTo to hide the reply form
  };

  const handleEdit = (commentId: string) => {
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    if (commentToEdit) {
      setEditingCommentId(commentId);
      setEditContent(commentToEdit.content);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (
    commentId: string,
    newContent: string,
    token: string
  ) => {
    try {
      const response = await axios.put(
        `/api/comments/${recipeId}/${commentId}`,
        {
          content: newContent,
        }
      );
      if (response.status === 200) {
        toast.success("Comment updated successfully!", {
          position: "top-center",
          autoClose: 5000,
        });
        onCommentAdded(); // Refresh the comments list
      } else {
        toast.error("Failed to update comment", {
          position: "top-center",
          autoClose: 5000,
        });
        throw new Error("Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setEditingCommentId(null); // Reset editing state
      setEditContent(""); // Clear edit content
    }
  };

  const handleDelete = async (commentId: string, token: string) => {
    try {
      setDeletingId(commentId);
      const response = await axios.delete(
        `/api/comments/${recipeId}/${commentId}`
      );
      if (response.status === 200) {
        toast.success("Comment deleted successfully!", {
          position: "top-center",
          autoClose: 5000,
        });
        onCommentAdded(); // Refresh the comments list
      } else {
        toast.error("Failed to delete comment", {
          position: "top-center",
          autoClose: 5000,
        });
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeletingId(null); // Reset deletingId state
      setCommentToDelete(null); // Reset the state
      setIsModalOpen(false); // Close the modal
    }
  };

  const renderComments = (
    comments: Comment[],
    parentCommentId?: string | null
  ) => {
    const defaultUserImageUrl = "/assets/images/guest-user.webp";

    return comments
      .filter((comment) => {
        if (parentCommentId === undefined) {
          return (
            comment.parentCommentId === null ||
            comment.parentCommentId === undefined
          );
        } else {
          return comment.parentCommentId === parentCommentId;
        }
      })
      .map((comment) => (
        <div
          key={comment.id}
          className={`w-full flex flex-col items-start justify-start bg-white rounded-md p-4 mb-2 ${
            comment.isPrimary ? "border-2 border-red-200" : "ml-4"
          } relative`}
        >
          <div className={cn("flex flex-row items-start justify-start w-full")}>
            <Image
              src={
                comment.userId
                  ? userAvatars[comment.userId] || defaultUserImageUrl
                  : defaultUserImageUrl
              }
              alt="User Profile"
              width={40}
              height={40}
              className={cn(
                "w-10 h-10 rounded-full border-2 mr-2",
                comment.userId && "border-websecondary"
              )}
            />
            <div className="flex flex-col w-full">
              <div className="flex items-center mb-1 justify-between">
                <div>
                  <span className="font-bold">{comment.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  {deletingId !== comment.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                          <EllipsisVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEdit(comment.id)}
                          className="cursor-pointer text-xs font-medium text-gray-700"
                        >
                          <SquarePen className="w-3 h-3 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCommentToDelete(comment.id);
                            setIsModalOpen(true);
                          }}
                          className="cursor-pointer text-xs font-medium text-gray-700"
                        >
                          <Trash className="w-3 h-3 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {deletingId === comment.id && (
                    <div className="ml-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <div className="flex flex-col">
                  <textarea
                    className="border rounded-md p-2 w-full resize-none"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex items-center mt-2 ">
                    <button
                      onClick={() =>
                        handleSaveEdit(comment.id, editContent, comment.token!)
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
                <div>{comment.content}</div>
              )}

              {comment.isPublished ? null : (
                <p className="text-sm text-gray-500 mt-2">
                  This comment is awaiting review and is only visible to you.
                </p>
              )}
              <div className="flex items-center mt-2">
                {/* <button className="mr-2 p-0">
                  <BiLike className="w-5 h-5 " />
                </button> */}
                <LikeButton
                  commentId={comment.id}
                  postId={recipeId}
                  initialLikes={comment.likes}
                />
                <Button
                  onClick={() => handleReplyClick(comment.id)}
                  variant="ghost"
                >
                  <FaReply className="w-5 h-5 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
          {replyingTo === comment.id && (
            <div className="flex flex-col w-full mt-4">
              <CommentsForm
                recipeId={recipeId}
                parentId={comment.id}
                title="Leave a reply"
                onCommentAdded={handleCommentAddedAndReset}
              />
            </div>
          )}
          {renderComments(comments, comment.id)}{" "}
          {/* Recursively render nested comments */}
        </div>
      ));
  };

  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <div className="flex justify-between w-full border-b-2 border-gray-200 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Questions & Replies
        </h1>
        {comments.length > 0 && (
          <p className="text-right font-bold text-websecondary text-xl">
            Comments: ({comments.length})
          </p>
        )}
      </div>
      {comments.length === 0 && (
        <p className="text-gray-500 text-sm">
          No comments yet. Be the first to comment!
        </p>
      )}
      {renderComments(comments)}
      <CommentDeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          const comment = comments.find((c) => c.id === commentToDelete);
          if (comment) {
            handleDelete(commentToDelete!, comment.token!);
          }
        }}
      />
    </div>
  );
};

export default CommentsList;
