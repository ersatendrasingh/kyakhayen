"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

import Pagination from "@/components/data-table/pagination";

import { RecipeWithCategory } from "@/types/recipe";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "./data-table";

interface RecipesTableProps {
  initialRecipes: RecipeWithCategory[];
  categories: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
  mealTimes: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    position: number | null;
  }[];
  cuisines: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    position: number | null;
  }[];
}

const RecipesTable = ({
  initialRecipes,
  categories,
  mealTimes,
  cuisines,
}: RecipesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedMealTime(null);
    setSelectedCuisine(null);
    setSearchQuery("");
  };
  const getFilteredRecipes = () => {
    let filteredRecipes = initialRecipes;

    if (selectedCategory) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.RecipeCategories?.id === selectedCategory
      );
    }

    if (selectedMealTime) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.recipeMealTime?.some(
          (mealTime) => mealTime.mealTimeId === selectedMealTime
        )
      );
    }

    if (selectedCuisine) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.recipeCuisine?.some(
          (cuisine) => cuisine.cuisineId === selectedCuisine
        )
      );
    }

    if (searchQuery) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredRecipes;
  };
  // Handle filtering and pagination
  const getCurrentPageItems = () => {
    const filteredRecipes = getFilteredRecipes();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecipes.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  const columns: ColumnDef<RecipeWithCategory>[] = [
    {
      accessorKey: "serialNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          S.No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {(currentPage - 1) * itemsPerPage + row.index + 1}
        </div>
      ),

      sortingFn: (rowA, rowB) => {
        const serialNumberA = (currentPage - 1) * itemsPerPage + rowA.index + 1;
        const serialNumberB = (currentPage - 1) * itemsPerPage + rowB.index + 1;
        return serialNumberA - serialNumberB;
      },
    },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => {
        const { imageUrl } = row.original;

        return (
          <div className="text-center">
            <Image
              src={imageUrl || "/assets/images/default-recipe.png"}
              alt={"Recipe image"}
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

        return <div>{title}</div>;
      },
    },
    {
      accessorKey: "RecipeCategories.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { RecipeCategories } = row.original;
        return (
          <div className="text-center">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold",
                RecipeCategories?.name === "Non Veg" &&
                  "text-red-500 border-red-500",
                RecipeCategories?.name === "Veg" &&
                  "text-green-500 border-green-500",
                RecipeCategories?.name === "Pescetarian" &&
                  "text-blue-500 border-blue-500",
                RecipeCategories?.name === "Eggetarian" &&
                  "text-yellow-500 border-yellow-500",
                RecipeCategories?.name === "Vegan" &&
                  "text-pink-500 border-pink-500"
              )}
            >
              {RecipeCategories?.name}
            </Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center items-center justify-center"
        >
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { isPublished } = row.original;
        return (
          <div className="text-center">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold",
                isPublished
                  ? "text-green-500 border-green-500"
                  : "text-gray-500 border-gray-500"
              )}
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
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
              <Link href={`/admin/recipes/${id}`}>
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
        {/* Search and Filter Section */}
        <h3>Filter Recipes </h3>
        <div className="flex ite justify-between mb-4 gap-2">
          {/* Category Filter */}
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category?.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Meal Time Filter */}
          <Select
            value={selectedMealTime || ""}
            onValueChange={(value) => setSelectedMealTime(value)}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select meal time" />
            </SelectTrigger>
            <SelectContent>
              {mealTimes.map((mealTime) => (
                <SelectItem key={mealTime.id} value={mealTime.id}>
                  {mealTime.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cuisine Filter */}
          <Select
            value={selectedCuisine || ""}
            onValueChange={(value) => setSelectedCuisine(value)}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine.id} value={cuisine.id}>
                  {cuisine.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            className="h-12 px-6 flex items-center space-x-2"
            onClick={clearFilters}
          >
            <XCircle className="h-5 w-5" />
            <span>Clear Filters</span>
          </Button>
        </div>

        <div className="flex justify-between">
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <Link href="/admin/recipes/create">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>

        {/* DataTable Component */}
        <DataTable columns={columns} data={getCurrentPageItems()} />
        <Pagination
          currentPage={currentPage}
          totalItems={getFilteredRecipes().length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </>
  );
};

export default RecipesTable;
