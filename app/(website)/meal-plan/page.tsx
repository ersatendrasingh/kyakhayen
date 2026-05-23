import { Metadata } from "next";
import MealPlan from "@/components/meal-plan/meal-plan";

import { PageTitle } from "@/components/page-title";
const meta = {
  title: "Personalized Meal Plans | Kya Khayen",
  description:
    "Explore weekly meal ideas based on your food preferences, favourite cuisines and ingredients you want to avoid.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/meal-plan.png`,
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/meal-plan`,
    type: "website",
    images: [
      {
        url: meta.image,
        width: 1200,
        height: 630,
        alt: meta.title,
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
