import { db } from "@/lib/db";
import { UsersDashboard } from "@/components/admin/users/users-dashboard";

const UsersPage = async () => {
  const users = await db.user.findMany({
    include: {
      foodPreference: true,
      cookingSkill: true,
      userCuisines: { include: { cuisine: true } },
      UserAllrgies: { include: { allergy: true } },
      UserPlan: { include: { plan: true }, orderBy: { endDate: "desc" } },
      UserMealPlan: { orderBy: { planStartDate: "desc" } },
      Order: { orderBy: { createdAt: "desc" } },
      _count: {
        select: { Favorite: true, Review: true, Comment: true, RecipeReaction: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UsersDashboard users={users} referenceDate={new Date().toISOString()} />
    </div>
  );
};

export default UsersPage;
