import HeroBannerCard from "@/components/sections/hero-banner-card";
import HomeCategory from "@/components/sections/home-category";
import PopularRecipes from "@/components/sections/popular-recipes";
import { db } from "@/lib/db";
import { Metadata } from "next";
import Head from "next/head";
type Banner = {
  id: number;
  title: string;
  spanTxt: string;
  description: string;
  btnTxt: string;
  image: string;
};

const homeBanner: Banner = {
  id: 1,
  title: "Explore Kya Khayen?",
  spanTxt: "Search healthy recipes to enjoy with your friends and family.",
  description:
    "Unitus Health Academy, started by Dr Shikha Sharma,  is an online platform to bring different health sciences under one umbrella and provide upskilling opportunities to health professionals and health enthusiasts.",
  btnTxt: "Explore Courses",
  image: "/assets/images/home-banner-3.webp",
};
const meta = {
  title: "Kya Khayen - Your Ultimate Global Recipe Hub",
  description:
    "Kya Khayen offers global cuisines at your fingertips. Discover meal inspiration, nutrition plans, and healthy recipes from around the world.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/home.png`,
  keywords: [
    "kya khayen healthy recipes",
    "healthy diet plan for weight loss",
    "best diet plan for weight loss",
    "diet meal plans for weight loss",
    "healthy breakfast recipe for weight loss",
    "healthy diet plans",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: process.env.NEXT_PUBLIC_APP_URL,
    locale: "en-US",
    siteName: meta.title,
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
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default async function Home() {
  const recipeCategories = await db.recipeCategories.findMany({
    orderBy: {
      position: "asc",
    },
  });

  return (
    <div>
      <HeroBannerCard
        banner={homeBanner}
        className="md:py-36 py-10 md:mb-4 xl:mb-4"
      />
      <HomeCategory title="Recipe Categories" widgetItems={recipeCategories} />
      <PopularRecipes />
    </div>
  );
}
