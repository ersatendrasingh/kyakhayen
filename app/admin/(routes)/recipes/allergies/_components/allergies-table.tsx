"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "@/components/data-table/pagination";
import { DataTable } from "@/components/data-table/data-table";

type Allergy = {
  id: string;
  title: string;
  imageUrl: string | null;
  totalRecipeCount: number;
};

interface AllergiesTableProps {
  initialAllergies: Allergy[];
}

const AllergiesTable = ({ initialAllergies }: AllergiesTableProps) => {
  const [allergies, setAllergies] = useState(initialAllergies);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/recipes/allergies/reorder`, {
        list: updateData,
      });
      toast.success("Allergies reordered successfully", {
        position: "top-center",
        autoClose: 5000,
      });
    } catch {
      toast.error("Something went wrong while reordering allergies", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const globalSourceIndex =
      (currentPage - 1) * itemsPerPage + result.source.index;
    const globalDestinationIndex =
      (currentPage - 1) * itemsPerPage + result.destination.index;

    const allItems = [...allergies];
    const [reorderedItem] = allItems.splice(globalSourceIndex, 1);
    allItems.splice(globalDestinationIndex, 0, reorderedItem);

    setAllergies(allItems);

    const bulkUpdateData = allItems.map((cuisine, index) => ({
      id: cuisine.id,
      position: index + 1,
    }));

    onReorder(bulkUpdateData);
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allergies.slice(startIndex, endIndex);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  const columns: ColumnDef<Allergy>[] = [
    {
      accessorKey: "serialNumber",
      header: "Sl. No.",
      cell: ({ row }) => (
        <div className="text-center">
          {(currentPage - 1) * itemsPerPage + row.index + 1}
        </div>
      ),
    },

    {
      accessorKey: "imageUrl",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Image
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { imageUrl } = row.original;

        return (
          <div className="text-center">
            <Image
              src={imageUrl || "/assets/images/default-category.jpg"}
              alt={"Cuisine image"}
              width={50}
              height={50}
            />
          </div>
        );
      },
    },

    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { title } = row.original;

        return (
          <div className="text-center">
            <span>{title}</span>
          </div>
        );
      },
    },

    {
      accessorKey: "totalRecipeCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Recipe Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { totalRecipeCount } = row.original;

        return (
          <div className="text-center">
            <span>{totalRecipeCount}</span>
          </div>
        );
      },
    },

    {
      id: "actions",
      header: ({ column }) => {
        return <span>Action</span>;
      },
      cell: ({ row }) => {
        const { id } = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-4 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/recipes/cuisines/${id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="h-3 w-3 mr-2 cursor-pointer" />
                  Edit
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <div className="relative">
        <DataTable
          columns={columns}
          data={getCurrentPageItems()}
          onDragEnd={handleDragEnd}
          filterableColumns={["title"]}
          filterPlaceholder="Cuisines"
        />

        <Pagination
          currentPage={currentPage}
          totalItems={allergies.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {isUpdating && (
          <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-red-700 animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default AllergiesTable;
