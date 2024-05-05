import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import MealTimeForm from "./_components/meal-time-form";
const MealTimePage = async () => {
  const mealTimes = await db.mealTimes.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <MealTimeForm />
        </div>
        <div>
          <DataTable columns={columns} data={mealTimes} />
        </div>
      </div>
    </div>
  );
};

export default MealTimePage;
