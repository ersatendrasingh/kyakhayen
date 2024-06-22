"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { generateRecipesForDate } from "@/lib/assignDiet";
import { currentUser } from "@/lib/auth";
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

export const generateMealPlan = async (): Promise<MealPlanResult[]> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const userId = user?.id;

    // Fetch user's meal plan to get start date and determine end date
    const userPlan = await db.userPlan.findFirst({
      where: {
        userId,
      },
    });

    if (!userPlan) {
      throw new Error(`Meal plan not found for user with ID ${userId}.`);
    }

    let startDate: Date;
    let endDate: Date;

    // Check if this is the first time plan is being generated
    const existingUserMealPlan = await db.userMealPlan.findFirst({
      where: {
        userId,
      },
    });

    if (existingUserMealPlan) {
      // If user already has a meal plan, use its start date
      startDate = existingUserMealPlan.planStartDate;
    } else {
      // Otherwise, use user's plan start date
      startDate = userPlan.startDate;
    }

    // Calculate end date as 30 days from start date
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 29);

    // Check if meal plan is already generated for this user and date range
    const isPlanAlreadyGenerated = await db.userMealPlan.findFirst({
      where: {
        userId,
        planStartDate: startDate,
        planEndDate: {
          gte: new Date(), // gte = Greater Than or Equal
        },
      },
    });

    if (isPlanAlreadyGenerated) {
      console.log(`Meal plan already generated for user ${userId}.`);
      return [];
    }

    // Create the user meal plan if not already created
    const createdUserMealPlan = isPlanAlreadyGenerated
      ? isPlanAlreadyGenerated
      : await db.userMealPlan.create({
          data: {
            userId,
            planStartDate: startDate,
            planEndDate: endDate,
          },
        });

    // Generate meal plans for each date between start and end date
    const dates = getDatesBetween(startDate, endDate);
    const mealPlanResults: MealPlanResult[] = [];

    for (const date of dates) {
      const mealsByTime = await generateRecipesForDate(userId, date);
      const mealPlanJson = JSON.stringify({ mealsByTime });
      const formattedDate = formatISO(date, { representation: "date" });

      const s3Key = `usersMealPlans/${userId}/${formattedDate}/diet.json`;

      // Upload meal plan JSON to S3
      const s3Response = await uploadToS3(s3Key, mealPlanJson);

      // Store the generated meal plan in the database
      const createdMealPlan = await db.mealPlan.create({
        data: {
          userMealPlanId: createdUserMealPlan.id,
          date,
          s3url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        },
      });

      // Update user meal plan to mark as generated
      await db.userMealPlan.update({
        where: { id: createdUserMealPlan.id },
        data: { isPlanGenerated: true },
      });

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
