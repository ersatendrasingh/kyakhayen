"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { generateRecipesForDate } from "@/lib/assignDiet";
import { currentUser } from "@/lib/auth";
import { formatISO, startOfDay } from "date-fns";

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

// Function to generate or update meal plan
export const updateMealPlan = async (): Promise<MealPlanResult[]> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const userId = user.id; // Assuming user.id is a non-nullable string

    // Get the current date as the start date
    const currentDate = startOfDay(new Date());

    // Fetch user's meal plan to get the latest start date and determine end date
    const userPlan = await db.userPlan.findFirst({
      where: {
        userId,
      },
    });

    if (!userPlan) {
      throw new Error(`Meal plan not found for user with ID ${userId}.`);
    }

    // Check if any meal plan exists from the current date onwards
    const existingMealPlans = await db.mealPlan.findMany({
      where: {
        usermealPlan: {
          userId,
          planStartDate: {
            lte: currentDate,
          },
        },
        date: {
          gte: currentDate,
        },
      },
    });

    if (existingMealPlans.length === 0) {
      throw new Error(
        `No existing meal plan found from ${currentDate} onwards for user with ID ${userId}.`
      );
    }

    // Generate meal plans for each existing plan date
    const mealPlanResults: MealPlanResult[] = [];

    for (const mealPlan of existingMealPlans) {
      const mealsByTime = await generateRecipesForDate(userId, mealPlan.date);
      const mealPlanJson = JSON.stringify({ mealsByTime });
      const formattedDate = formatISO(mealPlan.date, {
        representation: "date",
      });

      const s3Key = `usersMealPlans/${userId}/${formattedDate}/diet.json`;

      // Upload meal plan JSON to S3
      const s3Response = await uploadToS3(s3Key, mealPlanJson);

      // Update the S3 URL in the meal plan record
      await db.mealPlan.update({
        where: { id: mealPlan.id },
        data: {
          s3url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        },
      });

      mealPlanResults.push({ date: mealPlan.date, s3Url: s3Key });
    }

    return mealPlanResults;
  } catch (error) {
    console.error("Error generating or uploading meal plans:", error);
    throw error;
  }
};
