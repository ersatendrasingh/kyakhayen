import { db } from "@/lib/db";
import CouponTable from "./_components/coupons-table";

const CouponsPage = async () => {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6">
      <CouponTable coupons={coupons} />
    </div>
  );
};

export default CouponsPage;
