"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  BookOpen,
  CheckCircle2,
  Download,
  FilePenLine,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { getRecipeColumns } from "@/components/admin/recipes/recipe-columns";
import { RecipeCreateDrawer } from "@/components/admin/recipes/recipe-create-drawer";
import type {
  RecipeFilterOption,
  RecipeFilters,
  RecipeListRecord,
} from "@/components/admin/recipes/recipe-types";
import { exportRecipes } from "@/components/admin/recipes/recipe-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DeleteSelection =
  | { type: "single"; recipe: RecipeListRecord }
  | { type: "bulk"; recipes: RecipeListRecord[] }
  | null;

function buildPageHref(filters: RecipeFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.cuisineId) params.set("cuisine", filters.cuisineId);
  if (filters.mealTimeId) params.set("mealTime", filters.mealTimeId);
  if (filters.status) params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/recipes?${query}` : "/admin/recipes";
}

export function RecipesDashboard({
  recipes,
  categories,
  cuisines,
  mealTimes,
  stats,
  filters,
  page,
  pageCount,
  totalFiltered,
}: {
  recipes: RecipeListRecord[];
  categories: RecipeFilterOption[];
  cuisines: RecipeFilterOption[];
  mealTimes: RecipeFilterOption[];
  stats: {
    total: number;
    published: number;
    drafts: number;
    contentReady: number;
  };
  filters: RecipeFilters;
  page: number;
  pageCount: number;
  totalFiltered: number;
}) {
  const router = useRouter();
  const [filterValues, setFilterValues] = useState<RecipeFilters>(filters);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteSelection, setDeleteSelection] = useState<DeleteSelection>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const refresh = () => {
    setRowSelection({});
    router.refresh();
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRowSelection({});
    router.replace(buildPageHref(filterValues, 1), { scroll: false });
  };

  const clearFilters = () => {
    const cleared: RecipeFilters = {
      search: "",
      categoryId: "",
      cuisineId: "",
      mealTimeId: "",
      status: "",
    };
    setFilterValues(cleared);
    setRowSelection({});
    router.replace("/admin/recipes", { scroll: false });
  };

  const updatePublished = async (recipe: RecipeListRecord, checked: boolean) => {
    try {
      setPublishingId(recipe.id);
      const response = await fetch(
        `/api/recipes/${recipe.id}/${checked ? "publish" : "unpublish"}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error(
          checked
            ? "Description and cover image are required before publishing."
            : "Unable to unpublish recipe."
        );
      }

      toast.success(`${recipe.title} ${checked ? "published" : "unpublished"}`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update recipe status.");
    } finally {
      setPublishingId(null);
    }
  };

  const columns = getRecipeColumns(
    (recipe, checked) => void updatePublished(recipe, checked),
    (recipe) => setDeleteSelection({ type: "single", recipe }),
    publishingId
  );

  // TanStack Table owns mutable callbacks and cannot be safely compiler-memoized.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: recipes,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, rowSelection },
  });

  const selectedRecipes = recipes.filter((recipe) => rowSelection[recipe.id]);
  const deleteItems =
    deleteSelection?.type === "single"
      ? [deleteSelection.recipe]
      : deleteSelection?.recipes ?? [];

  const confirmDelete = async () => {
    if (!deleteItems.length) return;
    try {
      setDeleting(true);
      for (const recipe of deleteItems) {
        const response = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Unable to delete "${recipe.title}".`);
      }
      toast.success(
        deleteItems.length === 1 ? "Recipe deleted successfully" : "Recipes deleted successfully"
      );
      setDeleteSelection(null);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete recipes.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <section className="admin-taxonomy-hero rounded-[32px] p-5 sm:p-7 lg:p-9">
        <div className="relative z-[1] flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="admin-taxonomy-hero-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
              Recipe Studio
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Recipes workspace
              </h1>
              <p className="admin-taxonomy-hero-copy mt-2 text-sm sm:text-base">
                Build, review and publish recipe content with ingredients, steps and discovery
                coverage visible at a glance.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="admin-taxonomy-hero-action rounded-2xl"
              onClick={() => exportRecipes(recipes, "recipes-page.csv")}
            >
              <Download />
              Export Page
            </Button>
            <Button className="rounded-2xl shadow-sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Add Recipe
            </Button>
          </div>
        </div>
        <div className="relative z-[1] mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Recipes", value: stats.total, icon: BookOpen },
            { label: "Published", value: stats.published, icon: CheckCircle2 },
            { label: "Drafts", value: stats.drafts, icon: FilePenLine },
            { label: "Content Ready", value: stats.contentReady, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="admin-taxonomy-stat rounded-3xl px-5 py-5 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <p className="admin-taxonomy-stat-label text-sm font-medium">{stat.label}</p>
                <stat.icon className="admin-taxonomy-stat-icon size-5" />
              </div>
              <p className="admin-taxonomy-stat-value mt-3 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border bg-card p-4 shadow-sm sm:p-5">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_minmax(130px,170px)_minmax(130px,170px)_minmax(130px,170px)_minmax(120px,145px)_3rem_3rem]"
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-2xl pl-11"
              placeholder="Search recipes"
              value={filterValues.search}
              onChange={(event) =>
                setFilterValues((current) => ({ ...current, search: event.target.value }))
              }
            />
          </div>
          {[
            {
              value: filterValues.categoryId,
              key: "categoryId" as const,
              label: "All categories",
              options: categories,
            },
            {
              value: filterValues.cuisineId,
              key: "cuisineId" as const,
              label: "All cuisines",
              options: cuisines,
            },
            {
              value: filterValues.mealTimeId,
              key: "mealTimeId" as const,
              label: "All meal times",
              options: mealTimes,
            },
          ].map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(event) =>
                setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
              }
              className="h-12 cursor-pointer rounded-2xl border border-input bg-background px-4 text-sm"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
          <select
            value={filterValues.status}
            onChange={(event) =>
              setFilterValues((current) => ({ ...current, status: event.target.value }))
            }
            className="h-12 cursor-pointer rounded-2xl border border-input bg-background px-4 text-sm"
          >
            <option value="">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="incomplete">Needs content</option>
          </select>
          <div className="grid grid-cols-2 gap-3 xl:contents">
            <Button type="submit" className="h-12 rounded-2xl xl:size-12" aria-label="Apply filters">
              <SlidersHorizontal />
              <span className="xl:sr-only">Apply</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl xl:size-12"
              aria-label="Clear filters"
              onClick={clearFilters}
            >
              <RotateCcw />
              <span className="xl:sr-only">Clear</span>
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            disabled={!selectedRecipes.length}
            onClick={() => exportRecipes(selectedRecipes, "selected-recipes.csv")}
          >
            <Download />
            Export Selected
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            disabled={!selectedRecipes.length}
            onClick={() => setDeleteSelection({ type: "bulk", recipes: selectedRecipes })}
          >
            <Trash2 />
            Delete Selected
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-3xl border border-border/70">
          <Table>
            <TableHeader className="bg-muted/35">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-14 px-4",
                        header.column.id === "coverage" && "hidden lg:table-cell",
                        header.column.id === "updatedAt" && "hidden xl:table-cell"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-3",
                          cell.column.id === "coverage" && "hidden lg:table-cell",
                          cell.column.id === "updatedAt" && "hidden xl:table-cell"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    No recipes match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{totalFiltered} matching recipes</span>
              {selectedRecipes.length > 0 && (
                <Badge variant="secondary">{selectedRecipes.length} selected</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                {page > 1 ? <Link href={buildPageHref(filters, page - 1)}>Previous</Link> : "Previous"}
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pageCount} asChild={page < pageCount}>
                {page < pageCount ? <Link href={buildPageHref(filters, page + 1)}>Next</Link> : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <RecipeCreateDrawer
        key={createOpen ? "open" : "closed"}
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
      />

      <AlertDialog open={Boolean(deleteSelection)} onOpenChange={(open) => !open && setDeleteSelection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteItems.length === 1 ? "recipe" : "selected recipes"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes recipe content, ingredients, steps and attached media.
              Unpublish instead when the recipe may be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
