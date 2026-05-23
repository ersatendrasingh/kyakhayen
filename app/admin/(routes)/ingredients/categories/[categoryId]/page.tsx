import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { CategoryNameForm } from "./_components/category-name-form";
import { CategoryActions } from "./_components/category-actions";

const IngredientCategoryIdPage = async (
  props: {
    params: Promise<{ categoryId: string }>;
  }
) => {
  const params = await props.params;
  const ingredientCategory = await db.ingredientCategories.findUnique({
    where: {
      id: params.categoryId,
    },
  });

  if (!ingredientCategory) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Ingredient Category</h1>
          </div>
          <CategoryActions categoryId={params.categoryId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Category</h2>
            </div>
            <CategoryNameForm
              initialData={ingredientCategory}
              categoryId={ingredientCategory.id}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default IngredientCategoryIdPage;
