import { db } from "@/lib/db";
import SubscriptionPlansTable from "./_components/subscription-plans-table";

const SubscriptionPlansPage = async () => {
  const plans = await db.plan.findMany({
    include: { features: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <SubscriptionPlansTable subscriptionPlans={plans} />
    </div>
  );
};

export default SubscriptionPlansPage;
