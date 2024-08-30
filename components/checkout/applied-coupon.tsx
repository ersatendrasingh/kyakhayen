"use client";

interface AppliedCouponProps {
  code: string;
}

const AppliedCoupon = ({ code }: AppliedCouponProps) => {
  return (
    <div className="w-full flex flex-col items-start justify-start">
      <h1 className="text-2xl font-bold">Discount Coupon Code</h1>
      <h3 className="text-lg font-semibold text-emerald-500">
        Coupon code {code} applied successfully
      </h3>
    </div>
  );
};

export default AppliedCoupon;
