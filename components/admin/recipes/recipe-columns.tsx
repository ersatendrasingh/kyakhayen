"use client";

import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { RecipeListRecord } from "@/components/admin/recipes/recipe-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

export function getRecipeColumns(
  onPublish: (recipe: RecipeListRecord, published: boolean) => void,
  onDelete: (recipe: RecipeListRecord) => void,
  publishingId: string | null
): ColumnDef<RecipeListRecord>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all recipes on this page"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.title}`}
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto px-0 text-muted-foreground hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recipe
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const recipe = row.original;
        return (
          <div className="flex min-w-[270px] items-center gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted/50">
              {recipe.imageUrl ? (
                <Image src={recipe.imageUrl} alt="" fill className="object-cover" sizes="56px" />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/recipes/${recipe.id}`}
                className="line-clamp-2 font-semibold hover:text-primary"
              >
                {recipe.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {recipe.category?.name ?? "Category not assigned"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "coverage",
      header: "Content",
      cell: ({ row }) => {
        const recipe = row.original;
        const completed = [
          Boolean(recipe.description),
          Boolean(recipe.imageUrl),
          recipe.ingredientCount > 0,
          recipe.methodCount > 0,
        ].filter(Boolean).length;
        return (
          <div className="min-w-[130px] space-y-1">
            <p className="text-sm font-medium">{completed}/4 complete</p>
            <p className="text-xs text-muted-foreground">
              {recipe.ingredientCount} ingredients, {recipe.methodCount} steps
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto px-0 text-muted-foreground hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
            new Date(row.original.updatedAt)
          )}
        </span>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Published",
      cell: ({ row }) => (
        <div className="flex min-w-[120px] items-center gap-2">
          <Switch
            aria-label={`${row.original.isPublished ? "Unpublish" : "Publish"} ${row.original.title}`}
            checked={row.original.isPublished}
            disabled={publishingId === row.original.id}
            onCheckedChange={(checked) => onPublish(row.original, checked)}
            className="cursor-pointer"
          />
          <Badge variant={row.original.isPublished ? "secondary" : "outline"}>
            {row.original.isPublished ? "Live" : "Draft"}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Open recipe actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/recipes/${row.original.id}`}>
                <Pencil />
                Edit recipe
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 />
              Delete recipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];
}
