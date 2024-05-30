import { db } from "@/lib/db";

type HealthGoal = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

type getHealthGoalsInput = {
  userId: string;
};

export const getHealthGoals = async ({
  userId,
}: getHealthGoalsInput): Promise<HealthGoal[]> => {
  try {
    const allHealthGoals = await db.healthGoals.findMany();

    const userHealthGoals = await db.userHealthGoals.findMany({
      where: {
        userId,
      },
      select: {
        healthGoalId: true,
      },
    });

    const userHealthGoalIds = userHealthGoals.map(
      (userHealthGoal) => userHealthGoal.healthGoalId
    );

    const filteredHealthGoals = allHealthGoals.filter(
      (healthGoal) => !userHealthGoalIds.includes(healthGoal.id)
    );

    return filteredHealthGoals;
  } catch (error) {
    console.error("[GET_HEALTH_GOALS]", error);
    return [];
  }
};
