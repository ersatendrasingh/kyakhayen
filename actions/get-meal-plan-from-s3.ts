"use server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { RecipeWithCategory } from "@/types/recipe";
import { MealTimes } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

type GetMealPlanParams = {
  date: string; // Corrected to lowercase 'string'
};

type MealPlanResult = {
  mealTimes: MealTimes[];
  mealsByTime: { [key: string]: RecipeWithCategory[] };
};

type S3LookupError = Error & {
  $metadata?: { httpStatusCode?: number };
};

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

export const getMealPlanFromS3 = async ({
  date,
}: GetMealPlanParams): Promise<MealPlanResult | null> => {
  const user = await currentUser();

  try {
    // Get all meal times
    const mealTimes = await db.mealTimes.findMany({
      where: { isPublished: true },
    });
    // Sort meal times according to the specified order
    const order = ["Breakfast", "Mid Morning", "Lunch", "Evening", "Dinner"];
    mealTimes.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));

    // Construct the S3 key based on the date
    const dateFromClient = new Date(date);

    const formattedDate = dateFromClient.toISOString().split("T")[0];
    const s3Key = `usersMealPlans/${user?.id}/${formattedDate}/diet.json`;

    // Retrieve meal plan from S3
    const params = {
      Bucket: process.env.AWS_PRIVATE_BUCKET_NAME as string,
      Key: s3Key,
    };
    const command = new GetObjectCommand(params);
    const response = await getS3Client().send(command);

    // Read the content of the object from S3
    const stream = response.Body as Readable;

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString("utf-8");

    // Parse the JSON content
    const { mealsByTime } = JSON.parse(body);

    // Return the parsed meal plan
    return { mealTimes, mealsByTime };
  } catch (error) {
    const s3Error = error as S3LookupError;
    if (
      s3Error.name === "NoSuchKey" ||
      s3Error.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }

    console.error("[GET_MEAL_PLAN_FROM_S3]", error);
    throw new Error("Your saved meal plan could not be opened right now.");
  }
};
