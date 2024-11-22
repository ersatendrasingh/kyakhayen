import { Metadata } from "next";

import PricingTable from "@/components/subscription-plans/pricing-table";
import IntroSection from "@/components/subscription-plans/intro-section";
import { PageTitle } from "@/components/page-title";

const meta = {
  title: "Weight loss programs | pregnancy diet chart | keto diet plan",
  description:
    "Subscribe to our personalized meal plans and achieve your health goals! Get a 7-day diet plan for weight loss, pregnancy diet charts, and detox programs.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/subscription-plans.png`,
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-plans`,
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
