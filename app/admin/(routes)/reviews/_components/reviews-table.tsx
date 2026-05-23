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
import { ReviewWithRelations } from "@/types/review";
import StarRating from "@/components/reviews/star-rating";

interface ReviewsTableProps {
  reviews: ReviewWithRelations[];
}
const ReviewsTable = ({ reviews }: ReviewsTableProps) => {
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleApprove = async (postId: string, id: string) => {
    try {
      const response = await axios.post(`/api/reviews/${postId}/${id}/approve`);
      if (response.status === 200) {
        toast.success("Review approved successfully", {
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
        toast.error("Review already approved", {
          duration: 5000,
        });
      } else {
        toast.error("An error occurred while approving the review", {
          duration: 5000,
        });
      }
    }
  };

  const handleUnapprove = async (postId: string, id: string) => {
    try {
      const response = await axios.post(
        `/api/reviews/${postId}/${id}/unapprove`
      );
      if (response.status === 200) {
        toast.success("Review unapproved successfully", {
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
        toast.error("Review already unapproved", {
          duration: 5000,
        });
      } else {
        toast.error("An error occurred while unapproving the review", {
          duration: 5000,
        });
      }
    }
  };

  const handleDelete = async (postId: string, id: string) => {
    try {
      const response = await axios.delete(
        `/api/reviews/${postId}/${id}/delete`
      );
      if (response.status === 200) {
        toast.success("Review deleted successfully", {
          duration: 5000,
        });
        router.refresh();
      } else {
        toast.error("Something went wrong", {
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast.error("An error occurred while deleting the review", {
        duration: 5000,
      });
    }
  };

  const columns: ColumnDef<ReviewWithRelations>[] = [
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
      accessorKey: "comment",
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
        <div className="text-center">{row.getValue("comment")}</div>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-md font-bold mr-2">
            {row.getValue("rating")}
          </span>
          <StarRating
            value={Number(row.getValue("rating"))}
            size={20}
            activeClassName="fill-red-600 text-red-600"
          />
        </div>
      ),
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
        const { recipe } = row.original;
        const title = recipe?.title;
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
        const { id, recipeId, isPublished } = row.original;

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
                    onClick={() => handleUnapprove(recipeId!, id)}
                  >
                    <CircleX className="h-3 w-3 mr-2 cursor-pointer" />
                    Unapprove
                  </Button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="cursor-pointer">
                  <Button
                    variant="ghost"
                    onClick={() => handleApprove(recipeId!, id)}
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
                    setReviewToDelete(id);
                    setPostId(recipeId!);
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
      <DataTable columns={columns} data={reviews} />
      <CommentDeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(postId!, reviewToDelete!);
        }}
      />
    </>
  );
};

export default ReviewsTable;
