import { Skeleton } from "@/components/ui/skeleton";
import UserCuisines from "./_components/user-cuisines";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCuisines } from "@/actions/get-cuisines";
import UserAllergies from "./_components/user-allergies";
import { getAllergies } from "@/actions/get-allergies";
import UserHealthGoals from "./_components/user-health-goal";
import { getHealthGoals } from "@/actions/get-health-goals";
import { getFoodPreferences } from "@/actions/get-food-preferences";
import UserFoodPreferences from "./_components/user-food-preference";
import { getCookingSkills } from "@/actions/get-cooking-skills";
import UserCookingSkills from "./_components/user-cooking-skill";

const UserPreferencesPage = async () => {
  const user = await currentUser();
  if (!user) return;
  const userDetails = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      userCuisines: {
        include: {
          cuisine: true,
        },
      },
      UserAllrgies: {
        include: {
          allergy: true,
        },
      },
      UserHealthGoals: {
        include: {
          healthGoal: true,
        },
      },
      foodPreference: true,
      cookingSkill: true,
    },
  });

  const cuisines = await getCuisines({
    userId: user?.id,
  });

  const allergies = await getAllergies({
    userId: user?.id,
  });

  const healthGoals = await getHealthGoals({
    userId: user?.id,
  });

  const foodPreferences = await getFoodPreferences({
    userId: user?.id,
  });
  const cookingSkills = await getCookingSkills({
    userId: user?.id,
  });

  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-3xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        My Preferences
      </h1>
      {!userDetails ? (
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
          <UserFoodPreferences
            userData={userDetails}
            foodPreferences={foodPreferences}
          />
          <UserCookingSkills
            userData={userDetails}
            cookingSkills={cookingSkills}
          />
          <UserCuisines userData={userDetails} cuisines={cuisines} />
          <UserAllergies userData={userDetails} allergies={allergies} />
          <UserHealthGoals userData={userDetails} healthGoals={healthGoals} />
        </div>
      )}
    </div>
  );
};

export default UserPreferencesPage;
