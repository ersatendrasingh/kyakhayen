import type { Metadata } from "next";

import MealPlanBuilder from "@/components/meal-plan/meal-plan-builder";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Create Your Meal Plan | Kya Khayen",
  description:
    "Create a seven-day meal plan based on your food style, cuisines, ingredient exclusions and cooking comfort.",
  path: "/meal-plan/create",
  image: "/meta-images/meal-plan.png",
  imageAlt: "Create a Kya Khayen meal plan",
  noIndex: true,
});

export default async function CreateMealPlanPage() {
  const user = await currentUser();
  const [foodPreferences, cuisines, exclusions, cookingSkills, savedPreferences] =
    await Promise.all([
      db.recipeCategories.findMany({
        where: { isPublished: true, slug: { not: "desserts" } },
        select: { id: true, name: true, imageUrl: true },
        orderBy: [{ position: "asc" }, { name: "asc" }],
      }),
      db.cuisines.findMany({
        where: { isPublished: true },
        select: { id: true, title: true, imageUrl: true },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
      db.allergies.findMany({
        where: { isPublished: true, title: { not: "None" } },
        select: { id: true, title: true, imageUrl: true },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
      db.recipeDifficulty.findMany({
        select: { id: true, title: true, imageUrl: true },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
      user
        ? db.user.findUnique({
            where: { id: user.id },
            select: {
              foodPreferenceId: true,
              cookingSkillId: true,
              userCuisines: { select: { cuisineId: true } },
              UserAllrgies: { select: { allergyId: true } },
              UserPlan: {
                where: { endDate: { gte: new Date() } },
                orderBy: { endDate: "desc" },
                take: 1,
                include: { plan: true },
              },
            },
          })
        : Promise.resolve(null),
    ]);
  const activePlan = savedPreferences?.UserPlan[0]?.plan;
  const hasPaidAccess = Boolean(
    activePlan &&
      ((activePlan.priceInr || 0) > 0 || (activePlan.priceUsd || 0) > 0),
  );

  return (
    <MealPlanBuilder
      foodPreferences={foodPreferences.map((preference) => ({
        id: preference.id,
        title: preference.name,
        imageUrl: preference.imageUrl,
      }))}
      cuisines={cuisines}
      exclusions={exclusions}
      cookingSkills={cookingSkills}
      activePlanName={activePlan?.name}
      hasPaidAccess={hasPaidAccess}
      initialDraft={{
        foodPreference: savedPreferences?.foodPreferenceId ?? null,
        cuisines:
          savedPreferences?.userCuisines.map((selection) => selection.cuisineId) ??
          [],
        exclusions:
          savedPreferences?.UserAllrgies.map((selection) => selection.allergyId) ??
          [],
        cookingSkill: savedPreferences?.cookingSkillId ?? null,
      }}
    />
  );
}
