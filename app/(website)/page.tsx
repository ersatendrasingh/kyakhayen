import { Metadata } from "next";

import HeroBannerCard from "@/components/sections/hero-banner-card";
import HomeCategory from "@/components/sections/home-category";
import PersonalizationForm from "@/components/sections/personalization-form";
import PopularRecipes from "@/components/sections/popular-recipes";
import { db } from "@/lib/db";
import { getPrakritiQuestions } from "@/actions/get-prakriti-questions";

type Banner = {
  id: number;
  title: string;
  spanTxt: string;
  btnTxt: string;
  image: string;
  href?: string;
  points?: string[];
};

const banners = [
  {
    id: 1,
    title: "Download Our App",
    spanTxt: "Get the best features at your fingertips!",
    btnTxt: "Download Now",
    image: "/assets/images/home-banner-app-download.webp",
    href: "/",
    points: [
      "Personalized Meal Plans",
      "Exclusive Recipes",
      "Nutritional Insights",
      "Community Support",
      "Real-Time Notifications",
      "Offline Access",
      "User-Friendly Interface",
      "Enjoy a seamless and enjoyable user experience",
    ],
  },
  {
    id: 2,
    title: "Meal Plans",
    spanTxt: "Reach your goals with custom meal plans.",
    btnTxt: "Get Started",
    image: "/assets/images/meal-plan.webp",
    href: "/meal-plan",
    points: [
      "Weekly plans with easy-to-follow recipes",
      "Adjustable serving sizes",
      "Calorie and macronutrient tracking",
      "Track your daily intake and meet your health goals",
      "Meal prep tips and hacks",
      "Detailed nutritional information for every recipe",
      "Save your favorite recipes and meal plans offline",
      "Flexible and easy to modify",
    ],
  },
  // {
  //   id: 3,
  //   title: "Personalize Yourself",
  //   spanTxt: "Get your meal plan free",
  //   description: "Some description about personalization",
  //   btnTxt: "Get Started",
  //   image: "/assets/images/home-banner-personalization.webp", // replace with your image path
  // },
];

const homeBanner: Banner = {
  id: 1,
  title: "Explore Kya Khayen?",
  spanTxt: "Search healthy recipes to enjoy with your friends and family.",
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

  const cuisines = await db.cuisines.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const allergies = await db.allergies.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const healthGoals = await db.healthGoals.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const cookingSkills = await db.recipeDifficulty.findMany({
    orderBy: {
      position: "asc",
    },
  });
  const genders = await db.gender.findMany({
    orderBy: {
      position: "asc",
    },
  });

  const prakritiQuestions = await getPrakritiQuestions();

  return (
    <div>
      <HeroBannerCard banners={banners} />
      {/* <PersonalizationForm
        banner={homeBanner}
        cuisines={cuisines}
        allergies={allergies}
        healthGoals={healthGoals}
        cookingSkills={cookingSkills}
        foodPreferences={recipeCategories}
        prakritiQuestions={prakritiQuestions}
        genders={genders}
        className="md:py-12 py-10 md:mb-4 xl:mb-4"
      /> */}
      <HomeCategory title="Recipe Categories" widgetItems={recipeCategories} />
      <PopularRecipes />
    </div>
  );
}
