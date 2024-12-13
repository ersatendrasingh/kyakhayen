import { Metadata } from "next";
import HomeCategory from "@/components/sections/home-category";
import PopularRecipes from "@/components/sections/popular-recipes";
import { db } from "@/lib/db";
import { getPrakritiQuestions } from "@/actions/get-prakriti-questions";
import { currentUser } from "@/lib/auth";
import HomeBanner from "@/components/sections/home-banner";
import RecommendedRecipes from "@/components/sections/recommended-recipes";
import RecipeByMealTime from "@/components/sections/recipe-by-mealtime";
import { IntroSection } from "@/components/sections/intro-secion";

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
    spanTxt: "Get top features at your fingertips.",
    btnTxt: "Download Now",
    image: "/assets/images/home-banner-app-download.webp",
    href: "/download-app",
    points: [
      "AI-Powered Meal Plans",
      "Exclusive Recipe Library",
      "Health and Nutrition Tips",
      "Active Community Support",
      "Personalized Alerts and Notifications",
      "Track Your Progress",
      "Simple and Intuitive Design",
    ],
  },
  {
    id: 2,
    title: "Customized Meal Plans",
    spanTxt: "Achieve goals with tailored plans.",
    btnTxt: "Get Started",
    image: "/assets/images/meal-plan.webp",
    href: "/meal-plan",
    points: [
      "AI Powered Meal Plans",
      "Adjustable servings",
      "Calorie tracking",
      "Prep tips and hacks",
      "Nutritional info per recipe",
      "Save favorites offline",
      "Flexible and modifiable",
    ],
  },
];

const featureBanner = [
  {
    id: 1,
    title: "Achieve Health Goals",
    spanTxt: "AI-driven path to better health.",
    btnTxt: "Join Today",
    image: "/assets/images/meal-plan.webp",
    href: "/subscription-plans",
    points: [
      "Tailored to your health goals",
      "Fully automated, personalized plans",
      "Ayurvedic insights included",
      "1, 3, 6, 12-month options",
      "Clear path to success",
      "Start your journey now",
    ],
  },
  {
    id: 2,
    title: "Your Custom Diet Plan",
    spanTxt: "Personalized, AI-powered diet plan.",
    btnTxt: "Start Now",
    image: "/assets/images/macbook-app-download.webp",
    href: "/subscription-plans",
    points: [
      "AI-powered, tailored diet",
      "Custom-fit for goals and allergies",
      "Ayurvedic wellness insights",
      "Science-backed nutrition",
      "1, 3, 6, 12-month plans",
      "Results in one month",
    ],
  },

  {
    id: 3,
    title: "AI-Powered Nutrition",
    spanTxt: "A unique diet plan crafted just for you.",
    btnTxt: "Subscribe Now",
    image: "/assets/images/home-banner-app-download.webp",
    href: "/subscription-plans",
    points: [
      "Fully algorithm-driven diet plans",
      "Personalized to your goals and body type",
      "Aligns with your lifestyle preferences",
      "Scientifically designed for results",
      "Flexible subscription options",
      "Join the future of personalized health",
    ],
  },
];

const homeBanner: Banner = {
  id: 1,
  title: "Explore Kya Khayen?",
  spanTxt: "Search healthy recipes to enjoy with your friends and family.",
  btnTxt: "Explore Courses",
  image: "/assets/images/home-banner-1.webp",
};

export default async function Home() {
  const melaTimes = await db.mealTimes.findMany({
    orderBy: {
      position: "asc",
    },
  });

  const recipeCategories = await db.recipeCategories.findMany({
    orderBy: {
      position: "asc",
    },
  });

  const cuisines = await db.cuisines.findMany({
    where: {
      recipeCuisine: {
        some: {},
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  const allergies = await db.allergies.findMany({
    where: {
      recipeAllergies: {
        some: {},
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  const healthGoals = await db.healthGoals.findMany({
    where: {
      recipeHealthGoals: {
        some: {},
      },
    },
    orderBy: {
      position: "asc",
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

  const user = await currentUser();

  return (
    <div>
      <HomeBanner
        banner={homeBanner}
        banners={banners}
        featureBanners={featureBanner}
        cuisines={cuisines}
        allergies={allergies}
        healthGoals={healthGoals}
        cookingSkills={cookingSkills}
        foodPreferences={recipeCategories}
        prakritiQuestions={prakritiQuestions}
        genders={genders}
      />
      <IntroSection />
      <RecipeByMealTime title="Recipe By Meal Time" widgetItems={melaTimes} />
      <RecommendedRecipes
        userId={user?.id}
        isPersonalized={user?.isPersonalised || false}
      />
      <HomeCategory title="Recipe Categories" widgetItems={recipeCategories} />
      <PopularRecipes />
    </div>
  );
}
