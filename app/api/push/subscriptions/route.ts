import { NextResponse } from "next/server";
import { z } from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(512),
  p256dh: z.string().min(1).max(1000),
  auth: z.string().min(1).max(500),
  userAgent: z.string().max(1000).optional().nullable(),
});

const removalSchema = z.object({ endpoint: z.string().url().max(512) });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json("Invalid push subscription.", { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: { ...parsed.data, userId: user.id },
    update: { ...parsed.data, userId: user.id, isActive: true, failureReason: null },
  });

  return NextResponse.json({ message: "Push notifications enabled." });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  const parsed = removalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json("Invalid push subscription.", { status: 400 });

  await db.pushSubscription.updateMany({
    where: { endpoint: parsed.data.endpoint, userId: user.id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Push notifications disabled." });
}
