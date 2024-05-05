import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { MealTimeNameForm } from "./_components/meal-time-name-form";
import { ImageForm } from "./_components/image-form";
import { MealTimeActions } from "./_components/meal-time-actions";

const MealTimeIdPage = async ({
  params,
}: {
  params: { mealTimeId: string };
}) => {
  const mealTime = await db.mealTimes.findUnique({
    where: {
      id: params.mealTimeId,
    },
  });

  if (!mealTime) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Meal Time</h1>
          </div>
          <MealTimeActions mealTimeId={params.mealTimeId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Prakriti</h2>
            </div>
            <MealTimeNameForm
              initialData={mealTime}
              mealTimeId={params.mealTimeId}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Meal Time Image</h2>
              </div>
              <ImageForm
                initialData={mealTime}
                mealTimeId={params.mealTimeId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealTimeIdPage;
