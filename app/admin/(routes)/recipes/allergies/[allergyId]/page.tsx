import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { AllergyNameForm } from "./_components/allergy-name-form";
import { ImageForm } from "./_components/image-form";
import { AllergyActions } from "./_components/allergy-actions";

const AllergyIdPage = async ({ params }: { params: { allergyId: string } }) => {
  const allergy = await db.allergies.findUnique({
    where: {
      id: params.allergyId,
    },
  });

  if (!allergy) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Allergy</h1>
          </div>
          <AllergyActions allergyId={params.allergyId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Allergy</h2>
            </div>
            <AllergyNameForm initialData={allergy} allergyId={allergy.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Allergy Image</h2>
              </div>
              <ImageForm initialData={allergy} allergyId={allergy.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllergyIdPage;
