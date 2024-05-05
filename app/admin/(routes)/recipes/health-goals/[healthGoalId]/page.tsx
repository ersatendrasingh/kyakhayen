import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { HealthGoalNameForm } from "./_components/health-goal-name-form";
import { ImageForm } from "./_components/image-form";
import { HealthGoalActions } from "./_components/health-goal-actions";

const HealthGoalIdPage = async ({
  params,
}: {
  params: { healthGoalId: string };
}) => {
  const healthGoal = await db.healthGoals.findUnique({
    where: {
      id: params.healthGoalId,
    },
  });

  if (!healthGoal) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Prakriti</h1>
          </div>
          <HealthGoalActions healthGoalId={params.healthGoalId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Health Goal</h2>
            </div>
            <HealthGoalNameForm
              initialData={healthGoal}
              healthGoalId={healthGoal.id}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Health Goal Image</h2>
              </div>
              <ImageForm
                initialData={healthGoal}
                healthGoalId={healthGoal.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthGoalIdPage;
