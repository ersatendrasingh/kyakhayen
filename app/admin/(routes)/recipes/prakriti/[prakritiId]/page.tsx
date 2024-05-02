import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { PrakritiNameForm } from "./_components/prakriti-name-form";
import { ImageForm } from "./_components/image-form";
import { PrakritiActions } from "./_components/prakriti-actions";

const PrakritiIdPage = async ({
  params,
}: {
  params: { prakritiId: string };
}) => {
  const prakriti = await db.prakriti.findUnique({
    where: {
      id: params.prakritiId,
    },
  });

  if (!prakriti) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Prakriti</h1>
          </div>
          <PrakritiActions prakritiId={params.prakritiId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Prakriti</h2>
            </div>
            <PrakritiNameForm initialData={prakriti} prakritiId={prakriti.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Cooking Method Image</h2>
              </div>
              <ImageForm initialData={prakriti} prakritiId={prakriti.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrakritiIdPage;
