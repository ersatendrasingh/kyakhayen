import type { RecipeListRecord } from "@/components/admin/recipes/recipe-types";

const escapeCsv = (value: string | number | boolean | null) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

export function exportRecipes(recipes: RecipeListRecord[], fileName: string) {
  const rows = [
    ["title", "slug", "category", "ingredients", "steps", "published", "updatedAt"],
    ...recipes.map((recipe) => [
      recipe.title,
      recipe.slug,
      recipe.category?.name ?? "",
      recipe.ingredientCount,
      recipe.methodCount,
      recipe.isPublished,
      recipe.updatedAt,
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
