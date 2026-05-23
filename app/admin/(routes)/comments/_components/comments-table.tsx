"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CircleCheck,
  CircleX,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useState } from "react";
import { CommentDeleteConfirmModal } from "@/components/modals/comment-delete-confirm-modal";
import { CommentWithRelations } from "@/types/comment";

interface CommentsTableProps {
  comments: CommentWithRelations[];
}

const CommentsTable = ({ comments }: CommentsTableProps) => {
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleApprove = async (postId: string, id: string) => {
    try {
      const response = await axios.post(
        `/api/comments/${postId}/${id}/approve`
      );
      if (response.status === 200) {
        toast.success("Comment approved successfully", {
          duration: 5000,
        });
        router.refresh();
      } else {
        toast.error(response.data, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error("Comment already approved", {
          duration: 5000,
        });
      } else {
        toast.error("An error occurred while approving the comment", {
          duration: 5000,
        });
      }
    }
  };

  const handleUnapprove = async (postId: string, id: string) => {
    try {
      const response = await axios.post(
        `/api/comments/${postId}/${id}/unapprove`
      );
      if (response.status === 200) {
        toast.success("Comment unapproved successfully", {
          duration: 5000,
        });
        router.refresh();
      } else {
        toast.error("Something went wrong", {
          duration: 5000,
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error("Comment already unapproved", {
          duration: 5000,
        });
      } else {
        toast.error("An error occurred while unapproving the comment", {
          duration: 5000,
        });
      }
    }
  };

  const handleDelete = async (postId: string, id: string) => {
    try {
      const response = await axios.delete(
        `/api/comments/${postId}/${id}/delete`
      );
      if (response.status === 200) {
        toast.success("Comment deleted successfully", {
          duration: 5000,
        });
        router.refresh();
      } else {
        toast.error("Something went wrong", {
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast.error("An error occurred while deleting the comment", {
        duration: 5000,
      });
    }
  };

  const columns: ColumnDef<CommentWithRelations>[] = [
    {
      accessorKey: "serialNumber",
      header: "Sl. No.",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          User Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        return <div className="text-center">{user?.name}</div>;
      },
    },

    {
      accessorKey: "content",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Comment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("content")}</div>
      ),
    },
    {
      accessorKey: "likes",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Total Likes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("likes")}</div>
      ),
    },
    {
      accessorKey: "isPrimary",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Primary
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isPrimary = row.getValue("isPrimary") || false;

        return (
          <Badge
            className={cn(
              "bg-slate-500 text-center items-center justify-center",
              isPrimary && "bg-emerald-700"
            )}
          >
            {isPrimary ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished") || false;

        return (
          <Badge
            className={cn(
              "bg-slate-500 text-center items-center",
              isPublished && "bg-emerald-700"
            )}
          >
            {isPublished ? "Approved" : "Not Approved"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { recipeId } = row.original;
        const type = recipeId ? "Recipe" : "Article";
        return <div className="text-center">{type}</div>;
      },
    },
    {
      accessorKey: "recipe.title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Post
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { recipe, Post } = row.original;
        const title = recipe?.title || Post?.title;
        return <div className="text-center">{title}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Comment At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
          timeZone: "Asia/Kolkata",
        };
        const formattedTimestamp = createdAt.toLocaleString("en-IN", options);
        return <Badge className={cn("bg-red-700")}>{formattedTimestamp}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const { id, recipeId, postId, isPublished } = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-4 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPublished ? (
                <DropdownMenuItem className="cursor-pointer">
                  <Button
                    variant="ghost"
                    onClick={() => handleUnapprove(recipeId! || postId!, id)}
                  >
                    <CircleX className="h-3 w-3 mr-2 cursor-pointer" />
                    Unapprove
                  </Button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="cursor-pointer">
                  <Button
                    variant="ghost"
                    onClick={() => handleApprove(recipeId! || postId!, id)}
                  >
                    <CircleCheck className="h-3 w-3 mr-2 cursor-pointer" />
                    Approve
                  </Button>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCommentToDelete(id);
                    setPostId(recipeId! || postId!);
                    setIsModalOpen(true);
                  }}
                >
                  <Trash className="h-3 w-3 mr-2 cursor-pointer" />
                  Delete
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={comments} />
      <CommentDeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(postId!, commentToDelete!);
        }}
      />
    </>
  );
};

export default CommentsTable;
