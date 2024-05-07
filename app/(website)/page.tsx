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
  image: "/assets/images/home-banner-2.webp",
};
export const metadata: Metadata = {
  title:
    "Kya Khayen - Your Ultimate Global Recipe Hub: Desi, International, and Fusion Flavors",
  description:
    "Explore a world of culinary delights with our vast collection of recipes. From traditional cuisines to international favorites, find inspiration for every meal.",
  keywords: [
    "kya khayen healthy recipes",
    "healthy diet plan for weight loss",
    "best diet plan for weight loss",
    "diet meal plans for weight loss",
    "healthy breakfast recipe for weight loss",
    "healthy diet plans",
  ],
};
export default async function Home() {
  const recipeCategories = await db.recipeCategories.findMany({});

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
