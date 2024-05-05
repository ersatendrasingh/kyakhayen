import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { NutrientNameForm } from "./_components/nutrient-name-form";
import { ImageForm } from "./_components/image-form";
import { NutrientActions } from "./_components/nutrient-actions";

const NutrientIdPage = async ({
  params,
}: {
  params: { nutrientId: string };
}) => {
  const nutrient = await db.nutrient.findUnique({
    where: {
      id: params.nutrientId,
    },
  });

  if (!nutrient) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Nutrient</h1>
          </div>
          <NutrientActions nutrientId={params.nutrientId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Nutrient</h2>
            </div>
            <NutrientNameForm
              initialData={nutrient}
              nutrientId={params.nutrientId}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Nutrient Image</h2>
              </div>
              <ImageForm
                initialData={nutrient}
                nutrientId={params.nutrientId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NutrientIdPage;
