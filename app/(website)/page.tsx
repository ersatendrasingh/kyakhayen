import HomeCategory from "@/components/sections/home-category";
import PopularRecipes from "@/components/sections/popular-recipes";
import { db } from "@/lib/db";
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
      "Easy Meal Ideas",
      "Exclusive Recipe Library",
      "Ingredient and Nutrition Details",
      "Active Community Support",
      "Personalized Alerts and Notifications",
      "Track Your Progress",
      "Simple and Intuitive Design",
    ],
  },
  {
    id: 2,
    title: "Customized Meal Plans",
    spanTxt: "Plan meals around your taste and schedule.",
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
    title: "Cook With Confidence",
    spanTxt: "Practical meal ideas for everyday cooking.",
    btnTxt: "Join Today",
    image: "/assets/images/meal-plan.webp",
    href: "/subscription-plans",
    points: [
      "Tailored to your tastes",
      "Personalized recipe suggestions",
      "Ingredient avoidance preferences",
      "1, 3, 6, 12-month options",
      "Simple weekly planning",
      "Start cooking today",
    ],
  },
  {
    id: 2,
    title: "Your Custom Meal Plan",
    spanTxt: "Personalized ideas for your kitchen.",
    btnTxt: "Start Now",
    image: "/assets/images/macbook-app-download.webp",
    href: "/subscription-plans",
    points: [
      "AI-powered recipe ideas",
      "Fits tastes and ingredient exclusions",
      "Cooking-skill friendly options",
      "Nutrition information per recipe",
      "1, 3, 6, 12-month plans",
      "Flexible meal planning",
    ],
  },

  {
    id: 3,
    title: "AI-Powered Recipes",
    spanTxt: "A meal collection shaped by your preferences.",
    btnTxt: "Subscribe Now",
    image: "/assets/images/home-banner-app-download.webp",
    href: "/subscription-plans",
    points: [
      "Recipe ideas for your routine",
      "Personalized to cuisines you enjoy",
      "Aligns with your lifestyle preferences",
      "Easy to adjust and cook",
      "Flexible subscription options",
      "Discover something new to cook",
    ],
  },
];

const homeBanner: Banner = {
  id: 1,
  title: "Explore Kya Khayen?",
  spanTxt: "Find recipes to cook and enjoy with your friends and family.",
  btnTxt: "Explore Recipes",
  image: "/assets/images/home-banner-1.webp",
};

export default async function Home() {
  const melaTimes = await db.mealTimes.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const recipeCategories = await db.recipeCategories.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const cuisines = await db.cuisines.findMany({
    where: {
      isPublished: true,
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
      isPublished: true,
      recipeAllergies: {
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
  const user = await currentUser();

  return (
    <div>
      <HomeBanner
        banner={homeBanner}
        banners={banners}
        featureBanners={featureBanner}
        cuisines={cuisines}
        allergies={allergies}
        cookingSkills={cookingSkills}
        foodPreferences={recipeCategories}
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
