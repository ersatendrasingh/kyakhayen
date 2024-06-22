import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const UserSubscriptionPage = async () => {
  const user = await currentUser();

  const userData = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      UserPlan: {
        include: {
          plan: true,
        },
      },
    },
  });

  const calculateRemainingDays = (endDate: Date | null): string => {
    if (!endDate) return "Infinity";
    const currentDate = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays.toString() : "Expired";
  };

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
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full bg-white border border-gray-200 text-center">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <th className="py-2 border-b">Plan Name</th>
                      <th className="py-2 border-b">Start Date</th>
                      <th className="py-2 border-b">End Date</th>
                      <th className="py-2 border-b">Status</th>
                      <th className="py-2 border-b">Remaining Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.UserPlan.map((userPlan) => (
                      <tr key={userPlan.plan.id} className="border-b">
                        <td className="py-2">{userPlan.plan.name}</td>

                        <td className="py-2">
                          {new Date(userPlan.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          {userPlan.endDate
                            ? new Date(userPlan.endDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-2">
                          <Badge
                            className={
                              userPlan.endDate ? "bg-green-500" : "bg-red-500"
                            }
                          >
                            {userPlan.endDate &&
                            new Date(userPlan.endDate) > new Date()
                              ? "Active"
                              : "Expired"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {calculateRemainingDays(userPlan.endDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-hidden rounded-lg md:hidden shadow-sm divide-y divide-gray-200">
                {userData.UserPlan.map((userPlan) => (
                  <div key={userPlan.plan.id} className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-700 mb-2">
                          {userPlan.plan.name}
                        </h2>
                        <p className="text-gray-600">
                          <strong>Status:</strong>{" "}
                          {userPlan.endDate &&
                          new Date(userPlan.endDate) > new Date()
                            ? "Active"
                            : "Expired"}
                        </p>
                        <p className="text-gray-600">
                          <strong>Start Date:</strong>{" "}
                          {new Date(userPlan.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          <strong>End Date:</strong>{" "}
                          {userPlan.endDate
                            ? new Date(userPlan.endDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p className="text-gray-600">
                          <strong>Remaining Days:</strong>{" "}
                          {calculateRemainingDays(userPlan.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-600">No active subscriptions found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionPage;
