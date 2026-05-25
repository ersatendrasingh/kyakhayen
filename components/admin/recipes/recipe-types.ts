export type RecipeListRecord = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  isPublished: boolean;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  } | null;
  ingredientCount: number;
  methodCount: number;
};

export type RecipeFilterOption = {
  id: string;
  label: string;
};

export type RecipeFilters = {
  search: string;
  categoryId: string;
  cuisineId: string;
  mealTimeId: string;
  status: string;
};
