import { db } from "@/lib/db";

import HealthGoalForm from "./_components/health-goal-form";
import HealthGoalTable from "./_components/health-goal-table";
const HealthGoalPage = async () => {
  const healthGoals = await db.healthGoals.findMany({
    orderBy: {
      position: "asc",
    },
    include: {
      _count: {
        select: {
          recipeHealthGoals: true,
        },
      },
    },
  });
  const healthGoalsWithRecipeCount = healthGoals.map((healthGoal) => ({
    ...healthGoal,
    totalRecipeCount: healthGoal._count.recipeHealthGoals,
  }));
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <HealthGoalForm />
        </div>
        <div>
          <HealthGoalTable initialHealthGoals={healthGoalsWithRecipeCount} />
        </div>
      </div>
    </div>
  );
};

export default HealthGoalPage;
