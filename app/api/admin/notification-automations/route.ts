import {
  NotificationAudience,
  NotificationAutomationTrigger,
  NotificationSource,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVerifiedPublicMediaKey } from "@/lib/s3utils";

const ruleSchema = z.object({
  name: z.string().trim().min(3).max(80),
  trigger: z.nativeEnum(NotificationAutomationTrigger),
  segmentType: z.enum(["FOOD_STYLE", "CUISINE"]).optional().nullable(),
  segmentId: z.string().trim().optional().nullable(),
  titleTemplate: z.string().trim().min(3).max(120),
  bodyTemplate: z.string().trim().min(3).max(300),
  urlTemplate: z
    .string()
    .trim()
    .max(512)
    .refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), "Open link must be an internal path or HTTPS URL.")
    .optional()
    .nullable(),
  imageUrl: z.string().trim().url().max(512).optional().nullable().or(z.literal("")),
});

function sourceForTrigger(trigger: NotificationAutomationTrigger) {
  if (trigger === NotificationAutomationTrigger.RECIPE_PUBLISHED) return NotificationSource.PREFERENCE_PROMOTION;
  return NotificationSource[trigger];
}

export async function POST(request: Request) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const parsed = ruleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(parsed.error.issues[0]?.message || "Invalid automation rule.", { status: 400 });
  }
  const input = parsed.data;
  const isRecipeRule = input.trigger === NotificationAutomationTrigger.RECIPE_PUBLISHED;
  if (isRecipeRule && (!input.segmentType || !input.segmentId)) {
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
    await db.notificationAutomationRule.create({
      data: {
        name: input.name,
        trigger: input.trigger,
        source: sourceForTrigger(input.trigger),
        audience: isRecipeRule ? NotificationAudience.PREFERENCE_SEGMENT : NotificationAudience.USER,
        segmentType: isRecipeRule ? input.segmentType : null,
        segmentId: isRecipeRule ? input.segmentId : null,
        titleTemplate: input.titleTemplate,
        bodyTemplate: input.bodyTemplate,
        urlTemplate: input.urlTemplate || "/",
        imageUrl: input.imageUrl || null,
        createdById: admin.id,
        createdByName: admin.name || admin.email || "Admin",
      },
    }),
  );
}
