import { Queue } from "bullmq";

const mealPlanQueueConnection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_SERVER_PORT || "6379"),
};

export function getMealPlanQueue() {
  return new Queue("generateMealPlan", {
    connection: mealPlanQueueConnection,
  });
}
