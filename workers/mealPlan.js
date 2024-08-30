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

      // Update progress to 10%
      await job.updateProgress(10);
      console.log(`Job ${job.id}: Progress 10% - Meal plan generation started`);

      // Simulate some intermediate steps
      // For example, preparing data before sending the request
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      await job.updateProgress(30);
      console.log(`Job ${job.id}: Progress 30% - Data preparation done`);

      const response = await axios.post(`${APP_URL}/api/generate-meal-plan`, {
        userId: job.data.userId,
      });

      // Update progress to 70% after receiving the response
      await job.updateProgress(70);
      console.log(`Job ${job.id}: Progress 70% - Meal plan received from API`);

      // Simulate further processing if needed
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      await job.updateProgress(90);
      console.log(`Job ${job.id}: Progress 90% - Finalizing meal plan`);

      // Final progress update before completion
      await job.updateProgress(100);
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
