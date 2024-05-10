import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { TitleForm } from "./_components/title-form";
import { CategoryForm } from "./_components/category-form";
import { Banner } from "@/components/banner";
import { IngredientActions } from "./_components/ingredient-actions";
import { MacrosForm } from "./_components/macros-form";
import { MicrosForm } from "./_components/micros-form";

const IngredientIdPage = async ({
  params,
}: {
  params: { ingredientId: string };
}) => {
  const ingredient = await db.ingredients.findUnique({
    where: {
      id: params.ingredientId,
    },
  });

  if (!ingredient) {
    return redirect("/");
  }

  const categories = await db.ingredientCategories.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const requiredFields = [ingredient.name, ingredient.ingredientCategoriesId];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!ingredient.isPublished && (
        <Banner
          variant="warning"
          label="This ingredient is unpublished. It will not be visible to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Ingredient Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <IngredientActions
            disabled={!isComplete}
            ingredientId={params.ingredientId}
            isPublished={ingredient.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Ingredient</h2>
            </div>
            <TitleForm initialData={ingredient} ingredientId={ingredient.id} />

            <CategoryForm
              initialData={ingredient}
              ingredientId={ingredient.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
            <div className="flex items-center gap-x-2 mt-6">
              <IconBadge icon={ListChecks} />
              <h2 className="text-md">Ingredients Macros</h2>
            </div>
            <MacrosForm initialData={ingredient} ingredientId={ingredient.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center mt-4 gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Ingredients Micros</h2>
              </div>
              <MicrosForm
                initialData={ingredient}
                ingredientId={ingredient.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IngredientIdPage;
