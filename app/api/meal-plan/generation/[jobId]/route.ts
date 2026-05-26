import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { getMealPlanQueue } from "@/lib/meal-plan-queue";

export async function GET(
  _request: Request,
  props: { params: Promise<{ jobId: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  const { jobId } = await props.params;
  const queue = getMealPlanQueue();

  try {
    const job = await queue.getJob(jobId);
    if (!job || job.data.userId !== user.id) {
      return NextResponse.json("Generation job not found", { status: 404 });
    }

    const state = await job.getState();
    const rawProgress =
      typeof job.progress === "object" && job.progress !== null
        ? (job.progress as { percentage?: unknown; message?: unknown })
        : null;
    const progress =
      typeof job.progress === "number"
        ? { percentage: job.progress, message: "Preparing your meal plan" }
        : {
            percentage:
              typeof rawProgress?.percentage === "number"
                ? rawProgress.percentage
                : 0,
            message:
              typeof rawProgress?.message === "string"
                ? rawProgress.message
                : "Preparing your meal plan",
          };

    return NextResponse.json({
      state,
      percentage: state === "completed" ? 100 : progress.percentage,
      message: state === "completed" ? "Your meal plan is ready" : progress.message,
      error: state === "failed" ? job.failedReason : null,
    });
  } finally {
    await queue.close();
  }
}
