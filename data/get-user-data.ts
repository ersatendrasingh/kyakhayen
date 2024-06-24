import { db } from "@/lib/db";

export const getUserDataByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        userCuisines: {
          include: {
            cuisine: true,
          },
        },
        userPrakriti: true,
        cookingSkill: true,
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
        UserPlan: {
          include: {
            plan: true,
          },
        },
        UserMealPlan: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};
