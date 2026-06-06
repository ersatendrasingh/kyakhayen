import { NextResponse } from "next/server";
import { z } from "zod";

import {
  previewTrafficPush,
  sendTrafficPush,
  trafficPushSlotValues,
} from "@/lib/traffic-push";

const requestSchema = z.object({
  slot: z.enum(trafficPushSlotValues),
  dryRun: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const workerSecret =
    process.env.MEAL_PLAN_WORKER_SECRET ||
    (process.env.NODE_ENV !== "production" ? "local-meal-plan-worker" : "");
  if (!workerSecret || request.headers.get("x-meal-plan-worker-secret") !== workerSecret) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json("Invalid traffic push request.", { status: 400 });
  }

  if (parsed.data.dryRun) {
    return NextResponse.json(await previewTrafficPush(parsed.data.slot));
  }

  return NextResponse.json(await sendTrafficPush(parsed.data.slot));
}
