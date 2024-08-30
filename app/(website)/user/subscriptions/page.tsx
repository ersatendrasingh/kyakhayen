import { Skeleton } from "@/components/ui/skeleton";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import SubscriptionCard from "../_components/subscription-card";
import Link from "next/link";

const UserSubscriptionPage = async () => {
  const user = await currentUser();

  const userData = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      UserPlan: {
        where: {
          endDate: {
            gte: new Date(), // Only include plans where the end date is greater than or equal to the current date
          },
        },
        include: {
          plan: true,
        },
      },
    },
  });

  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-3xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        My Subscriptions
      </h1>
      {!user ? (
        <div className="flex flex-col justify-between w-full py-10">
          <div className="space-y-8 mt-4 w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between w-full py-10">
          {userData && userData.UserPlan.length > 0 ? (
            <>
              {userData.UserPlan.map((userPlan) => (
                <SubscriptionCard subscription={userPlan} key={userPlan.id} />
              ))}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg sm:shadow-xl p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                No Active Subscription
              </h2>
              <p className="text-gray-600 mt-2">
                You don't have an active subscription. Please choose a plan to
                continue enjoying our services.
              </p>
              <Link href="/subscription-plans#pricing">
                <button className="mt-4 bg-webprimary text-white py-2 px-4 rounded-md hover:bg-webprimary-dark">
                  View Subscription Plans
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionPage;
