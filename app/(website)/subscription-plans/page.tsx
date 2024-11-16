import { Metadata } from "next";

import PricingTable from "@/components/subscription-plans/pricing-table";
import IntroSection from "@/components/subscription-plans/intro-section";
import { PageTitle } from "@/components/page-title";

const meta = {
  title:
    "Subscription Plans - Kya Khayen? | Best healthy meals for weight loss | Weight loss programs",
  description:
    "Explore our subscription plans to access affordable personalized nutrition plans. Enjoy healthy recipes, healthy cookbook and best healthy meals for weight loss.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/subscription-plans.png`,
  keywords: [
    "diet plan for weight loss",
    "weight loss programs",
    "best weight loss program",
    "meal plan for weight loss",
    "weight loss plan",
    "7 day diet plan for weight loss",
    "best meal plan for weight loss",
    "meal plan for weight loss female",
    "best diet plan for weight loss",
    "best diet plan for weight loss for female",
    "low calorie meal plan",
    "diet chart for weight loss",
    "nutrition plan for weight loss",
    "healthy diet plan for weight loss",
    "diet plan for weight loss for female",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-plans`,
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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-plans`,
  },
};
const SubscriptionPlansPage = async () => {
  return (
    <div>
      <PageTitle title="Subscription Plans" className="py-6" />
      <IntroSection />
      <PricingTable />
    </div>
  );
};

export default SubscriptionPlansPage;
