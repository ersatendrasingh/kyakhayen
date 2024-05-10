import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { UnitNameForm } from "./_components/unit-name-form";
import { UnitActions } from "./_components/unit-actions";
import { UnitShortNameForm } from "./_components/unit-short-name-form";

const UnitIdPage = async ({ params }: { params: { unitId: string } }) => {
  const unit = await db.units.findUnique({
    where: {
      id: params.unitId,
    },
  });

  if (!unit) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Unit</h1>
          </div>
          <UnitActions unitId={params.unitId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Unit</h2>
            </div>
            <UnitNameForm initialData={unit} unitId={unit.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Unit Short Name</h2>
              </div>
              <UnitShortNameForm initialData={unit} unitId={unit.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitIdPage;
