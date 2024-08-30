"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { generateRecipesForDate } from "@/lib/assignDiet";

import { formatISO } from "date-fns";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

type MealPlanResult = {
  date: Date;
  s3Url: string;
};

// Helper function to upload data to S3
const uploadToS3 = async (fileName: string, fileContent: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: fileName,
    Body: fileContent,
    ContentType: "application/json",
  };
  const command = new PutObjectCommand(params);

  try {
    const data = await s3.send(command);
    return data;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const generateMealPlan = async (
  userId: string
): Promise<MealPlanResult[]> => {
  try {
    const now = new Date();

    // Fetch user's current active plan
    const userPlan = await db.userPlan.findFirst({
      where: {
        userId,
        endDate: {
          gte: now, // Plan must still be active
        },
      },
    });

    if (!userPlan) {
      throw new Error(`Meal plan not found for user with ID ${userId}.`);
    }

    // Fetch the existing meal plan entry
    let userMealPlan = await db.userMealPlan.findFirst({
      where: {
        userId,
        planEndDate: {
          gte: now, // Plan end date should be in the future
        },
      },
    });

    let startDate: Date;
    let endDate: Date = userPlan.endDate!;

    if (userMealPlan) {
      // If an active meal plan exists, start from today to regenerate
      startDate = now;

      // Update the meal plan's end date to match the current user plan's end date
      await db.userMealPlan.update({
        where: { id: userMealPlan.id },
        data: {
          planEndDate: endDate,
        },
      });
    } else {
      // If no active meal plan, create a new entry with the original start date
      startDate = userPlan.startDate;
      userMealPlan = await db.userMealPlan.create({
        data: {
          userId,
          planStartDate: startDate,
          planEndDate: endDate,
        },
      });
    }

    // Generate meal plans for each date between start and end date
    const dates = getDatesBetween(startDate, endDate);
    const mealPlanResults: MealPlanResult[] = [];

    for (const date of dates) {
      const mealsByTime = await generateRecipesForDate(userId, date);
      const mealPlanJson = JSON.stringify({ mealsByTime });
      const formattedDate = formatISO(date, { representation: "date" });

      const s3Key = `usersMealPlans/${userId}/${formattedDate}/diet.json`;

      // Upload meal plan JSON to S3
      await uploadToS3(s3Key, mealPlanJson);

      mealPlanResults.push({ date, s3Url: s3Key });
    }

    return mealPlanResults;
  } catch (error) {
    console.error("Error generating or uploading meal plans:", error);
    throw error;
  }
};

// Function to get dates between start and end date inclusive
const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
