import { PageHeader } from "@/components/page-header";

import { Metadata } from "next";
import MealPlan from "@/components/meal-plan/meal-plan";
const meta = {
  title:
    "Personalized Meal Plans - Kya Khayen? | Tailored Recipes for Every Taste",
  description:
    "Explore personalized meal plans with Kya Khayen?. Customize your meals based on your preferences, dietary restrictions, and health goals. Discover new recipes tailored just for you.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/assets/images/home-banner-personalization.webp`,
  keywords: [
    "Kya Khayen?",
    "personalized meal plans",
    "custom meal plans",
    "recipe customization",
    "dietary restrictions",
    "health goals",
    "tailored recipes",
    "meal planning",
    "nutrition",
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
const MealPlanPage = () => {
  return (
    <div>
      <PageHeader title="Meal Plan" className="py-6" />
      <MealPlan />
    </div>
  );
};

export default MealPlanPage;
