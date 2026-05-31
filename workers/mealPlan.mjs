import axios from "axios";
import { Worker } from "bullmq";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

// Define Redis connection options
const connection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_SERVER_PORT || "6379"),
};

const APP_URL =
  process.env.INTERNAL_APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";
const MEAL_PLAN_WORKER_SECRET =
  process.env.MEAL_PLAN_WORKER_SECRET ||
  (process.env.NODE_ENV !== "production" ? "local-meal-plan-worker" : "");

// Define the worker to process the queue
const worker = new Worker(
  "generateMealPlan",
  async (job) => {
    try {
      const isDeliveryJob = job.name === "deliverMealPlanDay";
      const isPushAutomationJob =
        job.name === "mealReminder" || job.name === "membershipExpiryReminder";
      const isCampaignJob = job.name === "sendNotificationCampaign";
      console.log(
        `Starting job ${job.id}: ${isDeliveryJob ? "Delivering meal plan day" : isPushAutomationJob ? "Sending automated push" : isCampaignJob ? "Sending scheduled campaign" : "Generating meal plan"}`
      );

      // Update progress to 10%
      await job.updateProgress({
        percentage: 5,
        message: isCampaignJob
          ? "Preparing scheduled broadcast"
          : isPushAutomationJob
            ? "Preparing reminder notification"
            : isDeliveryJob
          ? "Preparing daily meal-plan delivery"
          : "Starting your personalized meal plan",
      });

      const endpoint = isCampaignJob
        ? "/api/push/dispatch"
        : isPushAutomationJob
          ? "/api/push/automation"
          : isDeliveryJob
            ? "/api/deliver-meal-plan-day"
            : "/api/generate-meal-plan";
      const body = isCampaignJob
        ? { campaignId: job.data.campaignId }
        : isPushAutomationJob
          ? { ...job.data, kind: job.name }
          : isDeliveryJob
            ? { userId: job.data.userId, date: job.data.date }
            : { userId: job.data.userId, jobId: job.id };
      const response = await axios.post(
        `${APP_URL}${endpoint}`,
        body,
        {
          headers: {
            "x-meal-plan-worker-secret": MEAL_PLAN_WORKER_SECRET,
          },
        },
      );

      await job.updateProgress({
        percentage: 100,
        message: isCampaignJob
          ? "Scheduled broadcast delivered"
          : isPushAutomationJob
            ? "Reminder notification delivered"
            : isDeliveryJob
          ? "Daily meal-plan PDF delivered"
          : "Your meal plan is ready",
      });
      console.log(
        `Job ${job.id}: Progress 100% - complete`
      );

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Job ${job.id} failed during processing: ${message}`);
      throw error; // Re-throw the error to mark the job as failed
    }
  },
  { connection }
);

// Event listener for when the job is completed
worker.on("completed", (job, returnvalue) => {
  console.log(
    `Job ${job.id} completed successfully with result: ${returnvalue}`
  );
});

// Event listener for when the job fails
worker.on("failed", (job, error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Job ${job?.id} failed: ${message}`);
});

// Event listener for logging worker errors
worker.on("error", (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Worker encountered an error: ${message}`);
});

console.log("Worker started");
