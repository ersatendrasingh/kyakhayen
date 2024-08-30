import { db } from "@/lib/db";
import { assignPlanToUser } from "@/lib/assignPlanToUser";

export async function assignFreePlanToUser(userId: string) {
  try {
    const freePlan = await db.plan.findFirst({
      where: { name: "Freemium" }, // Adjust this condition to match your free plan
    });

    if (!freePlan) {
      throw new Error("Free plan not found");
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Assuming the free plan lasts 7 days

    const userPlan = await assignPlanToUser(
      userId,
      freePlan.id,
      startDate,
      endDate
    );
    console.log(`Assigned free plan to user ${userId}`);
    return userPlan;
  } catch (error) {
    console.error("Error assigning free plan to user:", error);
    throw error;
  }
}
