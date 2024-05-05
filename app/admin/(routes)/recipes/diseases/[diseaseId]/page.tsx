import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { DiseaseNameForm } from "./_components/disease-name-form";
import { ImageForm } from "./_components/image-form";
import { DiseaseActions } from "./_components/disease-actions";

const DiseaseIdPage = async ({ params }: { params: { diseaseId: string } }) => {
  const disease = await db.disease.findUnique({
    where: {
      id: params.diseaseId,
    },
  });

  if (!disease) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Disease</h1>
          </div>
          <DiseaseActions diseaseId={params.diseaseId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Disease</h2>
            </div>
            <DiseaseNameForm
              initialData={disease}
              diseaseId={params.diseaseId}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Cooking Method Image</h2>
              </div>
              <ImageForm initialData={disease} diseaseId={params.diseaseId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiseaseIdPage;
