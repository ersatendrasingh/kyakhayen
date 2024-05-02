import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { CuisineNameForm } from "./_components/cuisine-name-form";
import { ImageForm } from "./_components/image-form";
import { CuisineActions } from "./_components/cuisine-actions";

const CuisineIdPage = async ({ params }: { params: { cuisineId: string } }) => {
  const cuisine = await db.cuisines.findUnique({
    where: {
      id: params.cuisineId,
    },
  });

  if (!cuisine) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Cuisine</h1>
          </div>
          <CuisineActions cuisineId={params.cuisineId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Cuisine</h2>
            </div>
            <CuisineNameForm initialData={cuisine} cuisineId={cuisine.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Cuisine Image</h2>
              </div>
              <ImageForm initialData={cuisine} cuisineId={cuisine.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CuisineIdPage;
