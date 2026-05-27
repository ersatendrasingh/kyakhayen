import { Queue } from "bullmq";
import { formatISO } from "date-fns";

const mealPlanQueueConnection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_SERVER_PORT || "6379"),
};

export function getMealPlanQueue() {
  return new Queue("generateMealPlan", {
    connection: mealPlanQueueConnection,
  });
}

export async function scheduleMealPlanDeliveries(
  userId: string,
  deliveryDates: Date[],
) {
  const queue = getMealPlanQueue();

  try {
    for (const targetDate of deliveryDates) {
      const date = formatISO(targetDate, { representation: "date" });
      const [year, month, day] = date.split("-").map(Number);
      const deliveryAt = new Date(Date.UTC(year, month - 1, day, 10, 30));
      deliveryAt.setUTCDate(deliveryAt.getUTCDate() - 1);

      await queue.add(
        "deliverMealPlanDay",
        { userId, date },
        {
          delay: Math.max(deliveryAt.getTime() - Date.now(), 0),
          jobId: `daily-plan-${userId}-${date}`,
          removeOnComplete: true,
        },
      );
    }
  } finally {
    await queue.close();
  }
}
