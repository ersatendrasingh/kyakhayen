import { Metadata } from "next";
import MealPlan from "@/components/meal-plan/meal-plan";

import { PageTitle } from "@/components/page-title";
const meta = {
  title:
    "Personalized Meal Plans - Kya Khayen? | Diet chart for weight loss | best meal plan for weight loss",
  description:
    "Our meal planning service offers customized meal plans, healthy balanced diets, low calorie recipes, and healthy meal plans for weight loss and overall well-being.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/meal-plan.png`,
  keywords: [
    "Kya Khayen?",
    "personalized meal plans",
    "meal plans for weight loss",
    "healthy recipes for weight loss",
    "custom diet plans",
    "recipe customization",
    "meal plans to gain muscle",
    "balanced diet plans",
    "calorie-conscious meal plans",
    "nutrition-based recipes",
    "meal planning service",
    "healthy meal plans",
    "diet plans for females",
    "Indian meal plans",
    "low-calorie meal plans",
    "7-day diet plan",
    "weight loss meal ideas",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/meal-plan`,
    type: "website",
    images: [
      {
        url: meta.image,
      },
    ],
  },
  twitter: {
    title: meta.title,
    description: meta.description,
    images: [meta.image],
    card: "summary_large_image",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/meal-plan`,
  },
};
const MealPlanPage = async () => {
  return (
    <div>
      <PageTitle title="Meal Plan" className="py-6" />
      <MealPlan />
    </div>
  );
};

export default MealPlanPage;
