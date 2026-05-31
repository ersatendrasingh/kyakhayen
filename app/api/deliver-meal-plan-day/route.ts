import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { render } from "react-email";
import { NextResponse } from "next/server";

import CustomerMealPlanMail from "@/emails/customer-meal-plan-mail";
import { db } from "@/lib/db";
import { generateMealPlanPdf } from "@/lib/generate-meal-plan-pdf";
import { hydrateMealPlanRecipes } from "@/lib/hydrate-meal-plan-recipes";
import { sendEmail } from "@/lib/mail";
import type { RecipeWithCategory } from "@/types/recipe";

function getPrivateStorage() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_PRIVATE_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Private meal-plan storage is not configured.");
  }

  return {
    bucket,
    client: new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export async function POST(request: Request) {
  const workerSecret =
    process.env.MEAL_PLAN_WORKER_SECRET ||
    (process.env.NODE_ENV !== "production" ? "local-meal-plan-worker" : "");
  if (
    !workerSecret ||
    request.headers.get("x-meal-plan-worker-secret") !== workerSecret
  ) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const { userId, date } = await request.json();
    if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      return NextResponse.json("Invalid delivery request", { status: 400 });
    }

    const planDate = new Date(`${date}T00:00:00.000Z`);
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        foodPreference: {
          select: { name: true },
        },
        cookingSkill: {
          select: { title: true },
        },
        userCuisines: {
          include: {
            cuisine: {
              select: { title: true, position: true },
            },
          },
        },
        UserAllrgies: {
          include: {
            allergy: {
              select: { title: true, position: true },
            },
          },
        },
        UserPlan: {
          include: { plan: true },
          where: { endDate: { gte: planDate } },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    });
    const activePlan = user?.UserPlan[0]?.plan;
    const isPaidAccess = Boolean(
      activePlan &&
        ((activePlan.priceInr || 0) > 0 || (activePlan.priceUsd || 0) > 0),
    );

    if (!user?.email || !isPaidAccess) {
      return NextResponse.json("Active paid delivery not found", {
        status: 404,
      });
    }

    const storage = getPrivateStorage();
    const object = await storage.client.send(
      new GetObjectCommand({
        Bucket: storage.bucket,
        Key: `usersMealPlans/${userId}/${date}/diet.json`,
      }),
    );
    const json = await object.Body?.transformToString();
    if (!json) {
      return NextResponse.json("Meal plan document not found", {
        status: 404,
      });
    }
    const { mealsByTime = {} } = JSON.parse(json) as {
      mealsByTime?: Record<string, RecipeWithCategory[]>;
    };
    const currentMealsByTime = await hydrateMealPlanRecipes(mealsByTime);
    const attachment = await generateMealPlanPdf(
      {
        name: user.name || "Member",
        email: user.email,
        accessLabel: `${activePlan?.name || "Membership"} access`,
        foodStyle: user.foodPreference?.name,
        cookingComfort: user.cookingSkill?.title,
        cuisines: [...user.userCuisines]
          .sort(
            (first, second) =>
              (first.cuisine.position ?? Number.MAX_SAFE_INTEGER) -
              (second.cuisine.position ?? Number.MAX_SAFE_INTEGER),
          )
          .map(({ cuisine }) => cuisine.title),
        exclusions: [...user.UserAllrgies]
          .sort(
            (first, second) =>
              (first.allergy.position ?? Number.MAX_SAFE_INTEGER) -
              (second.allergy.position ?? Number.MAX_SAFE_INTEGER),
          )
          .map(({ allergy }) => allergy.title),
      },
      [{ date: planDate, mealsByTime: currentMealsByTime }],
      "Tomorrow's delivery",
    );

    await sendEmail({
      to: user.email,
      subject: "Tomorrow's Kya Khayen meal plan is ready",
      html: await render(
        CustomerMealPlanMail({
          name: user.name || "Member",
          daysIncluded: 1,
          isDailyDelivery: true,
        }),
      ),
      attachments: [attachment],
    });

    return NextResponse.json({ delivered: true });
  } catch (error) {
    console.error("[DELIVER_MEAL_PLAN_DAY]", error);
    return NextResponse.json("Meal plan delivery failed", { status: 500 });
  }
}
