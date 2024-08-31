import { Metadata } from "next";

import PricingTable from "@/components/subscription-plans/pricing-table";
import IntroSection from "@/components/subscription-plans/intro-section";

import { getSubscriptionPlans } from "@/actions/get-subscription-plans";

const meta = {
  title:
    "Subscription Plans - Kya Khayen? | Subscribe to Our Monthly Meal Plans",
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
  const subscriptionPlans = await getSubscriptionPlans();

  return (
    <div>
      <IntroSection />
      <PricingTable subscriptionPlans={subscriptionPlans} />
    </div>
  );
};

export default SubscriptionPlansPage;
