import {
  BadgeIndianRupeeIcon,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { CodeForm } from "./_components/code-form";
import { CouponTypeForm } from "./_components/coupon-type-form";
import { Banner } from "@/components/banner";
import { CouponAmountForm } from "./_components/coupon-amount-form";
import { CouponProductForm } from "./_components/coupon-product-form";
import { CouponActions } from "./_components/coupon-actions";
import { CouponExpiryForm } from "./_components/coupon-expiry-form";

const CouponIdPage = async ({ params }: { params: { couponId: string } }) => {
  const coupon = await db.coupon.findUnique({
    where: {
      id: params.couponId,
    },
    include: {
      PlanOnCoupon: {
        include: {
          plan: true,
        },
      },
    },
  });

  const plans = await db.plan.findMany({
    where: {
      isPublished: true,
    },
  });

  if (!coupon) {
    return redirect("/");
  }

  const couponTypes = [
    { label: "Fixed Product", value: "FIXED_PRODUCT" },
    { label: "Cart Percentage", value: "CART_PERCENTAGE" },
  ];

  const requiredFields = [
    coupon.code,
    coupon.discountType,
    coupon.discountValue,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!coupon.isActive && (
        <Banner
          variant="warning"
          label="This coupon is inactive. It will not be available to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Coupon Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <CouponActions
            disabled={!isComplete}
            couponId={params.couponId}
            isPublished={coupon.isActive}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Coupon</h2>
            </div>
            <CodeForm initialData={coupon} couponId={coupon.id} />
            <CouponTypeForm
              initialData={coupon}
              couponId={coupon.id}
              options={couponTypes}
            />
            <CouponAmountForm initialData={coupon} couponId={coupon.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Coupon for Plans </h2>
              </div>
              <CouponProductForm
                initialData={coupon}
                couponId={coupon.id}
                productOptions={plans.map((plan) => ({
                  label: plan.name,
                  value: plan.id,
                }))}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Coupon Expire Date </h2>
              </div>
              <CouponExpiryForm initialData={coupon} couponId={coupon.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponIdPage;
