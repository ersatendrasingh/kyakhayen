import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { CategoryNameForm } from "./_components/category-name-form";
import { ImageForm } from "./_components/image-form";
import { CategoryActions } from "./_components/category-actions";

const RecipeCategoryIdPage = async ({
  params,
}: {
  params: { categoryId: string };
}) => {
  const recipeCategory = await db.recipeCategories.findUnique({
    where: {
      id: params.categoryId,
    },
  });

  if (!recipeCategory) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Recipe Category</h1>
          </div>
          <CategoryActions categoryId={params.categoryId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Recipe</h2>
            </div>
            <CategoryNameForm
              initialData={recipeCategory}
              categoryId={recipeCategory.id}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Category Image</h2>
              </div>
              <ImageForm
                initialData={recipeCategory}
                categoryId={recipeCategory.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeCategoryIdPage;
