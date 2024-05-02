import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { CookingMethodNameForm } from "./_components/cooking-method-name-form";
import { ImageForm } from "./_components/image-form";
import { CookingMethodActions } from "./_components/cooking-method-actions";

const CookingMethodIdPage = async ({
  params,
}: {
  params: { cookingMethodId: string };
}) => {
  const cookingMethod = await db.cookingMethods.findUnique({
    where: {
      id: params.cookingMethodId,
    },
  });

  if (!cookingMethod) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Cooking Method</h1>
          </div>
          <CookingMethodActions cookingMethodId={params.cookingMethodId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Cooking Method</h2>
            </div>
            <CookingMethodNameForm
              initialData={cookingMethod}
              cookingMethodId={cookingMethod.id}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Cooking Method Image</h2>
              </div>
              <ImageForm
                initialData={cookingMethod}
                cookingMethodId={cookingMethod.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookingMethodIdPage;
