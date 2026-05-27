import { NotificationAudience, NotificationAutomationTrigger, NotificationSource } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVerifiedPublicMediaKey } from "@/lib/s3utils";

const updateSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().trim().min(3).max(80).optional(),
  trigger: z.nativeEnum(NotificationAutomationTrigger).optional(),
  segmentType: z.enum(["FOOD_STYLE", "CUISINE"]).nullable().optional(),
  segmentId: z.string().trim().nullable().optional(),
  titleTemplate: z.string().trim().min(3).max(120).optional(),
  bodyTemplate: z.string().trim().min(3).max(300).optional(),
  urlTemplate: z
    .string()
    .trim()
    .max(512)
    .refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), "Open link must be an internal path or HTTPS URL.")
    .nullable()
    .optional(),
  imageUrl: z.string().trim().url().max(512).nullable().optional().or(z.literal("")),
});

function sourceForTrigger(trigger: NotificationAutomationTrigger) {
  if (trigger === NotificationAutomationTrigger.RECIPE_PUBLISHED) return NotificationSource.PREFERENCE_PROMOTION;
  return NotificationSource[trigger];
}

export async function PATCH(request: Request, props: { params: Promise<{ ruleId: string }> }) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const { ruleId } = await props.params;
  const existing = await db.notificationAutomationRule.findUnique({ where: { id: ruleId } });
  if (!existing) return NextResponse.json("Automation rule not found.", { status: 404 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(parsed.error.issues[0]?.message || "Invalid automation update.", { status: 400 });
  }
  const input = parsed.data;
  const trigger = input.trigger || existing.trigger;
  const segmentType = input.segmentType === undefined ? existing.segmentType : input.segmentType;
  const segmentId = input.segmentId === undefined ? existing.segmentId : input.segmentId;
  const isRecipeRule = trigger === NotificationAutomationTrigger.RECIPE_PUBLISHED;
  if (isRecipeRule && (!segmentType || !segmentId)) {
    return NextResponse.json("Choose which recipe preference should trigger this automation.", { status: 400 });
  }
  if (input.imageUrl) {
    try {
      getVerifiedPublicMediaKey(input.imageUrl);
    } catch {
      return NextResponse.json("Select the notification image from the media library.", { status: 400 });
    }
  }

  return NextResponse.json(
    await db.notificationAutomationRule.update({
      where: { id: ruleId },
      data: {
        ...input,
        imageUrl: input.imageUrl === "" ? null : input.imageUrl,
        source: sourceForTrigger(trigger),
        audience: isRecipeRule ? NotificationAudience.PREFERENCE_SEGMENT : NotificationAudience.USER,
        segmentType: isRecipeRule ? segmentType : null,
        segmentId: isRecipeRule ? segmentId : null,
      },
    }),
  );
}

export async function DELETE(_request: Request, props: { params: Promise<{ ruleId: string }> }) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const { ruleId } = await props.params;
  const rule = await db.notificationAutomationRule.findUnique({ where: { id: ruleId } });
  if (!rule) return NextResponse.json("Automation rule not found.", { status: 404 });
  if (rule.isSystem) return NextResponse.json("Built-in automation rules can be paused, not deleted.", { status: 400 });
  await db.notificationAutomationRule.delete({ where: { id: ruleId } });
  return NextResponse.json({ deleted: true });
}
