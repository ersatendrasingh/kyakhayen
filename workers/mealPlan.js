const { Worker, Queue } = require("bullmq");
const axios = require("axios");

// Define Redis connection options
const connection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_SERVER_PORT || "6379"),
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

      const response = await axios.post(`${APP_URL}/api/generate-meal-plan`, {
        userId: job.data.userId,
      });

      console.log(`Generated meal plan: ${response.data.mealPlan}`);
      return response.data.mealPlan;
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
