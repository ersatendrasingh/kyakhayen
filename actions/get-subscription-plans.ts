import { db } from "@/lib/db";
import { Feature, Plan } from "@prisma/client";

type SubscriptionPlan = Plan & {
  features: Feature[];
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const allSubscriptionPlans = await db.plan.findMany({
      where: {
        isPublished: true,
      },
      include: {
        features: true,
      },
    });

    const order = ["Bronze", "Silver", "Gold", "Platinum"];

    // Sort the plans based on the desired order
    allSubscriptionPlans.sort((a, b) => {
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return allSubscriptionPlans;
  } catch (error) {
    console.error("[GET_SUBSCRIPTION_PLANS]", error);
    return [];
  }
};
