import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import HealthGoalForm from "./_components/health-goal-form";
const HealthGoalPage = async () => {
  const healthGoals = await db.healthGoals.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <HealthGoalForm />
        </div>
        <div>
          <DataTable columns={columns} data={healthGoals} />
        </div>
      </div>
    </div>
  );
};

export default HealthGoalPage;
