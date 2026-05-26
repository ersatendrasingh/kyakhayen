"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { generateRecipesForDate } from "@/lib/assignDiet";

import { formatISO } from "date-fns";
import { sendEmail } from "@/lib/mail";
import { render } from "react-email";
import CustomerMealPlanMail from "@/emails/customer-meal-plan-mail";

const getS3Client = () => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_PRIVATE_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("AWS private meal-plan storage is not configured.");
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
};

type MealPlanResult = {
  date: Date;
  s3Url: string;
};

type MealPlanProgressReporter = (
  percentage: number,
  message: string,
) => Promise<void> | void;

// Helper function to upload data to S3
const uploadToS3 = async (fileName: string, fileContent: string) => {
  const params = {
    Bucket: process.env.AWS_PRIVATE_BUCKET_NAME as string,
    Key: fileName,
    Body: fileContent,
    ContentType: "application/json",
  };
  const command = new PutObjectCommand(params);

  try {
    const data = await getS3Client().send(command);
    return data;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const generateMealPlan = async (
  userId: string,
  reportProgress?: MealPlanProgressReporter,
): Promise<MealPlanResult[]> => {
  try {
    const now = new Date();
    await reportProgress?.(10, "Understanding your food preferences");

    // Fetch user's details
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    await reportProgress?.(16, "Preparing your seven-day canvas");

    // Fetch user's current active plan
    const userPlan = await db.userPlan.findFirst({
      where: {
        userId,
        endDate: {
          gte: now, // Plan must still be active
        },
      },
    });

    // Fetch the existing meal plan entry
    let userMealPlan = await db.userMealPlan.findFirst({
      where: {
        userId,
        planEndDate: {
          gte: now, // Plan end date should be in the future
        },
      },
    });

    const launchEndDate = new Date(now);
    launchEndDate.setDate(launchEndDate.getDate() + 6);
    let startDate: Date;
    const endDate =
      userPlan?.endDate && userPlan.endDate > launchEndDate
        ? userPlan.endDate
        : launchEndDate;

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
      // Launch access always provides a fresh seven-day plan without purchase.
      startDate = now;
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

    for (const [index, date] of dates.entries()) {
      const mealsByTime = await generateRecipesForDate(userId, date);
      if (!mealsByTime) {
        throw new Error(`Unable to generate meals for ${date.toISOString()}.`);
      }
      const mealPlanJson = JSON.stringify({ mealsByTime });
      const formattedDate = formatISO(date, { representation: "date" });

      const s3Key = `usersMealPlans/${userId}/${formattedDate}/diet.json`;

      // Upload meal plan JSON to S3
      await uploadToS3(s3Key, mealPlanJson);

      mealPlanResults.push({ date, s3Url: s3Key });
      const percentage = Math.round(18 + ((index + 1) / dates.length) * 66);
      await reportProgress?.(
        percentage,
        `Curating day ${index + 1} of ${dates.length}`,
      );
    }

    await reportProgress?.(91, "Saving your weekly plan");
    try {
      await sendEmail({
        to: user.email as string,
        subject: "Your Customized Meal Plan is Ready For You!",
        html: await render(
          CustomerMealPlanMail({
            subjectLine: "Exciting News! Your Personalized Meal Plan Awaits.",
            name: user.name as string,
          })
        ),
      });
    } catch (emailError) {
      console.error("Meal plan created, but ready email could not be sent:", emailError);
    }
    await reportProgress?.(97, "Your meal plan is ready");

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
