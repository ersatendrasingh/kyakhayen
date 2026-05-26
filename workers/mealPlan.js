const { Worker, Queue } = require("bullmq");
const axios = require("axios");

// Define Redis connection options
const connection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_SERVER_PORT || "6379"),
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MEAL_PLAN_WORKER_SECRET =
  process.env.MEAL_PLAN_WORKER_SECRET ||
  (process.env.NODE_ENV !== "production" ? "local-meal-plan-worker" : "");

// Create a new queue
const mealPlanQueue = new Queue("generateMealPlan", { connection });

// Define the worker to process the queue
const worker = new Worker(
  "generateMealPlan",
  async (job) => {
    try {
      console.log(
        `Starting job ${job.id}: Generating meal plan for user ${job.data.userId}`
      );

      // Update progress to 10%
      await job.updateProgress({
        percentage: 5,
        message: "Starting your personalized meal plan",
      });

      const response = await axios.post(`${APP_URL}/api/generate-meal-plan`, {
        userId: job.data.userId,
        jobId: job.id,
      }, {
        headers: {
          "x-meal-plan-worker-secret": MEAL_PLAN_WORKER_SECRET,
        },
      });

      await job.updateProgress({
        percentage: 100,
        message: "Your meal plan is ready",
      });
      console.log(
        `Job ${job.id}: Progress 100% - Meal plan generation complete`
      );

      return response.data;
    } catch (err) {
      console.error(`Job ${job.id} failed during processing: ${err.message}`);
      throw err; // Re-throw the error to mark the job as failed
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
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

// Event listener for logging worker errors
worker.on("error", (err) => {
  console.error(`Worker encountered an error: ${err.message}`);
});

console.log("Worker started");
