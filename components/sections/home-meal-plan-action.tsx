"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";

type HomeMealPlanActionProps = {
  variant: "hero" | "story";
};

export default function HomeMealPlanAction({
  variant,
}: HomeMealPlanActionProps) {
  const { data: session, status } = useSession();
  const hasMealPlan = Boolean(session?.user?.isPersonalised);
  const label = hasMealPlan ? "View my meal plan" : "Build my meal plan";
  const href = hasMealPlan ? "/meal-plan" : "/meal-plan/create";

  if (status === "loading") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          variant === "hero"
            ? "home-hero-secondary-action inline-flex h-12 w-44 animate-pulse items-center rounded-full bg-white/10"
            : "h-[50px] w-48 animate-pulse rounded-full bg-white/12",
        )}
      />
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        className="home-hero-secondary-action inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-[#f8d18a]"
      >
        <PlayCircle className="size-6" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold transition hover:bg-websecondary-400"
    >
      {label} <ArrowRight className="size-4" />
    </Link>
  );
}
