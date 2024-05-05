import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { DietTypeNameForm } from "./_components/diet-type-name-form";
import { ImageForm } from "./_components/image-form";
import { DietTypeActions } from "./_components/diet-type-actions";

const DietTypeIdPage = async ({
  params,
}: {
  params: { dietTypeId: string };
}) => {
  const dietType = await db.dietTypes.findUnique({
    where: {
      id: params.dietTypeId,
    },
  });

  if (!dietType) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Diet Type</h1>
          </div>
          <DietTypeActions dietTypeId={params.dietTypeId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Diet Type</h2>
            </div>
            <DietTypeNameForm
              initialData={dietType}
              dietTypeId={params.dietTypeId}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Diet Type Image</h2>
              </div>
              <ImageForm
                initialData={dietType}
                dietTypeId={params.dietTypeId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DietTypeIdPage;
