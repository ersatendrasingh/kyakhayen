import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { RecipeTypeNameForm } from "./_components/recipe-type-name-form";
import { ImageForm } from "./_components/image-form";
import { RecipeTypeActions } from "./_components/recipe-type-actions";

const RecipeTypeIdPage = async ({
  params,
}: {
  params: { recipeTypeId: string };
}) => {
  const recipeType = await db.recipeTypes.findUnique({
    where: {
      id: params.recipeTypeId,
    },
  });

  if (!recipeType) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Recipe Type</h1>
          </div>
          <RecipeTypeActions recipeTypeId={params.recipeTypeId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Recipe Type</h2>
            </div>
            <RecipeTypeNameForm
              initialData={recipeType}
              recipeTypeId={params.recipeTypeId}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Recipe Type Image</h2>
              </div>
              <ImageForm
                initialData={recipeType}
                recipeTypeId={params.recipeTypeId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeTypeIdPage;
