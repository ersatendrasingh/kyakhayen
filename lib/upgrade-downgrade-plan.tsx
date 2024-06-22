import { db } from "@/lib/db";
import { assignPlanToUser } from "@/lib/assignPlanToUser";

// Function to calculate end date based on plan type (e.g., Freemium, Silver)
async function calculateEndDate(planId: string) {
  const planDetails = await db.plan.findFirst({
    where: { id: planId },
  });

  if (!planDetails) {
    throw new Error("Plan not found");
  }
  // Logic to calculate end date based on plan type or duration
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + planDetails.durationMonths!);
  return endDate;
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

// Function to assign or update plans for a user
export async function assignOrUpdatePlans(userId: string, newPlanId: string) {
  try {
    // Fetch current user's plans
    const userPlans = await db.userPlan.findMany({
      where: {
        userId,
      },
    });

    // Check if the user has existing plans
    if (userPlans.length === 0) {
      const startDate = new Date();
      const endDate = await calculateEndDate(newPlanId);

      // If no plans exist, create a new user plan
      await assignPlanToUser(userId, newPlanId, startDate, endDate);
    } else {
      // User already has plans, add or update plans
      const existingPlanIds = userPlans.map((plan) => plan.planId);

      if (!existingPlanIds.includes(newPlanId)) {
        // If new plan is not already in user's plans, add it
        const startDate = new Date();
        const endDate = await calculateEndDate(newPlanId);
        await assignPlanToUser(userId, newPlanId, startDate, endDate);
      } else {
        // If new plan is already in user's plans, update it (extend duration, etc.)
        const userPlanToUpdate = userPlans.find(
          (plan) => plan.planId === newPlanId
        );

        if (userPlanToUpdate) {
          const existingPlan = await db.plan.findFirst({
            where: {
              id: newPlanId,
            },
          });

          if (!existingPlan) {
            throw new Error("Plan not found");
          }

          // Calculate the new end date by adding the new plan's duration days to the existing end date
          const existingEndDate = userPlanToUpdate.endDate;
          const newEndDate = addDays(
            existingEndDate!,
            existingPlan.durationMonths!
          );

          await db.userPlan.update({
            where: {
              id: userPlanToUpdate.id,
            },
            data: {
              endDate: newEndDate, // Add the new plan's duration days to the existing end date
            },
          });
        }
      }
    }

    console.log(`Plan ${newPlanId} assigned/updated for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning/updating plans:", error);
    throw error;
  }
}

// Function to downgrade or remove plans for a user
export async function downgradeOrRemovePlan(
  userId: string,
  planIdToRemove: string
) {
  try {
    // Fetch current user's plans
    const userPlans = await db.userPlan.findMany({
      where: {
        userId,
      },
    });

    // Check if the plan to be removed exists in user's plans
    const planToRemove = userPlans.find(
      (plan) => plan.planId === planIdToRemove
    );

    if (planToRemove) {
      // If plan exists, remove it or update end date
      await db.userPlan.delete({
        where: {
          id: planToRemove.id,
        },
      });
    } else {
      // Handle case where plan to remove does not exist
      console.log(`Plan ${planIdToRemove} not found for user ${userId}`);
      return { error: "Plan not found" };
    }

    console.log(`Plan ${planIdToRemove} removed for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing plan:", error);
    throw error;
  }
}
