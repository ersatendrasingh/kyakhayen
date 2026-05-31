import { NotificationAutomationTrigger } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { runUserAutomationRules } from "@/lib/notification-automations";

const requestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mealReminder"),
    userId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    meal: z.string().min(1),
  }),
  z.object({
    kind: z.literal("membershipExpiryReminder"),
    userId: z.string().min(1),
    assignmentId: z.string().min(1),
    label: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const workerSecret =
    process.env.MEAL_PLAN_WORKER_SECRET ||
    (process.env.NODE_ENV !== "production" ? "local-meal-plan-worker" : "");
  if (!workerSecret || request.headers.get("x-meal-plan-worker-secret") !== workerSecret) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json("Invalid automation request.", { status: 400 });
  const input = parsed.data;

  if (input.kind === "mealReminder") {
    const planDate = new Date(`${input.date}T00:00:00.000Z`);
    const exists = await db.userMealPlan.findFirst({
      where: { userId: input.userId, planStartDate: { lte: planDate }, planEndDate: { gte: planDate } },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ skipped: true, reason: "Meal plan no longer active." });
    const executed = await runUserAutomationRules({
      trigger: NotificationAutomationTrigger.MEAL_REMINDER,
      userId: input.userId,
      tokens: { meal: input.meal },
      dedupeScope: `meal-reminder-${input.userId}-${input.date}-${input.meal.toLowerCase()}`,
    });
    return NextResponse.json({ sent: executed > 0, executed });
  }

  const assignment = await db.userPlan.findFirst({
    where: { id: input.assignmentId, userId: input.userId, endDate: { not: null } },
    include: { plan: { select: { name: true } } },
  });
  if (!assignment) return NextResponse.json({ skipped: true, reason: "Membership no longer exists." });
  const executed = await runUserAutomationRules({
    trigger: NotificationAutomationTrigger.MEMBERSHIP_EXPIRY,
    userId: input.userId,
    tokens: {
      planName: assignment.plan.name,
      expiryTiming: input.label,
      expiryAction: input.label === "today" ? "ends today" : "expires in 3 days",
    },
    dedupeScope: `membership-expiry-${assignment.id}-${input.label}`,
  });
  return NextResponse.json({ sent: executed > 0, executed });
}
