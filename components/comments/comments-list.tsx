import { useState, useEffect } from "react";
import { BiLike } from "react-icons/bi";
import { FaReply } from "react-icons/fa";
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
import { EllipsisVertical } from "lucide-react";

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
    // Logic to handle edit
  };

  const handleDelete = (commentId: string) => {
    // Logic to handle delete
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
          className={`w-full flex flex-col items-start justify-start bg-white rounded-md p-4  mb-2 ${
            comment.isPrimary ? "border-2 border-red-200" : "ml-4"
          }`}
        >
          <div
            className={cn("flex flex-row items-start justify-start w-full ")}
          >
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                      <EllipsisVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEdit(comment.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(comment.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>{comment.content}</div>
              {comment.isPublished ? null : (
                <p className="text-sm text-gray-500 mt-2">
                  This comment is awaiting review and is only visible to you.
                </p>
              )}
              <div className="flex items-center mt-2">
                <button className="mr-2 p-0">
                  <BiLike className="w-5 h-5 " />
                </button>
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
      <div className="flex justify-between w-full border-b-2 border-gray-200  mb-4">
        <h1 className="text-xl font-bold text-gray-800  mb-4">
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
    </div>
  );
};

export default CommentsList;
