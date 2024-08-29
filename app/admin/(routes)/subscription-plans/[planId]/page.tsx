import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { TitleForm } from "./_components/title-form";

import { Banner } from "@/components/banner";
import { PlanActions } from "./_components/plan-actions";
import { PriceForm } from "./_components/price-form";
import { DurationForm } from "./_components/duration-form";
import { FeaturesForm } from "./_components/features-form";
import { RegularPriceForm } from "./_components/regular-price-form";

const SubscriptionPlanIdPage = async ({
  params,
}: {
  params: { planId: string };
}) => {
  const plan = await db.plan.findUnique({
    where: {
      id: params.planId,
    },
    include: {
      features: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!plan) {
    return redirect("/");
  }

  const requiredFields = [
    plan.name,
    plan.priceInr,
    plan.priceUsd,
    plan.durationMonths,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!plan.isPublished && (
        <Banner
          variant="warning"
          label="This plan is unpublished. It will not be visible to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Subscription Plan Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <PlanActions
            disabled={!isComplete}
            planId={params.planId}
            isPublished={plan.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Plan</h2>
            </div>
            <TitleForm initialData={plan} planId={plan.id} />

            <RegularPriceForm initialData={plan} planId={plan.id} />

            <PriceForm initialData={plan} planId={plan.id} />

            <DurationForm initialData={plan} planId={plan.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Plan Features</h2>
              </div>
              <FeaturesForm initialData={plan} planId={plan.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlanIdPage;
