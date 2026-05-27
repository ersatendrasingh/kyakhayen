import type { Metadata } from "next";

import {
  InterestSpotlight,
  type MealPlanDay,
  type MealPlanMoment,
  MealPlanStory,
  SeasonalSpotlight,
} from "@/components/sections/home-discovery";
import HomeCuisineExplorer from "@/components/sections/home-cuisine-explorer";
import HomeFoodPreference from "@/components/sections/home-food-preference";
import HomeFeaturedRecipes from "@/components/sections/home-featured-recipes";
import { HomePreferenceProvider } from "@/components/sections/home-preference-context";
import PremiumHomeHero from "@/components/sections/premium-home-hero";
import MembershipPromptModal from "@/components/sections/membership-prompt-modal";
import HomeEditorialStories from "@/components/sections/home-editorial-stories";
import { getMealPlanFromS3 } from "@/actions/get-meal-plan-from-s3";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.kyakhayen.com";
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");
const heroVideoKeys = [
  "media/homepage/hero/20260524/hero-breakfast-prep.mp4",
  "media/homepage/hero/20260524/hero-food-story-02.mp4",
  "media/homepage/hero/20260524/hero-food-story-03.mp4",
  "media/homepage/hero/20260524/hero-food-story-04.mp4",
  "media/homepage/hero/20260524/hero-food-story-05.mp4",
];
const seasonalEditorialKey =
  "media/homepage/discovery/20260524/summer-green-smoothie.webp";
const ingredientEditorialKey =
  "media/homepage/discovery/20260524/paneer-stuffed-cheela.webp";

export const metadata: Metadata = {
  title: "Kya Khayen | Discover Recipes and Personalized Meal Plans",
  description:
    "Discover beautiful Indian and international recipes, explore meals by cuisine and time of day, and create personalized meal plans with Kya Khayen.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Kya Khayen | Discover Recipes and Personalized Meal Plans",
    description:
      "Beautiful everyday recipes, cuisines and personalized meal planning inspiration.",
    url: siteUrl,
    type: "website",
    images: [{ url: `${siteUrl}/meta-images/home.png`, width: 1200, height: 630 }],
  },
};

export default async function Home() {
  const now = new Date();
  const dayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(now);
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(tomorrow);
  const tomorrowLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(tomorrow);
  const user = await currentUser();
  const heroVideoUrls = mediaBaseUrl
    ? heroVideoKeys.map((key) => `${mediaBaseUrl}/${key}`)
    : [];
  const seasonalEditorialImage = mediaBaseUrl
    ? `${mediaBaseUrl}/${seasonalEditorialKey}`
    : "/assets/images/smoothie.png";
  const ingredientEditorialImage = mediaBaseUrl
    ? `${mediaBaseUrl}/${ingredientEditorialKey}`
    : "/meta-images/recipe-page.jpg";
  const [
    catalogRecipeCount,
    featuredRecipes,
    summerRecipes,
    cuisineStories,
    paneerRecipes,
    foodPreferenceStories,
    homeArticles,
  ] = await Promise.all([
      db.recipes.count(),
      db.recipes.findMany({
        where: {
          isPublished: true,
          imageUrl: { not: null },
          RecipeCategories: { slug: { in: ["veg", "vegan"] } },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          metaSlug: true,
          imageUrl: true,
          RecipeCategories: { select: { name: true } },
          recipeCookingTime: {
            select: { prepTime: true, cookTime: true, restTime: true },
          },
          recipeCuisine: {
            select: { cuisine: { select: { title: true } } },
            take: 1,
          },
          recipeNutrient: {
            where: { nutrient: { isPublished: true } },
            select: { nutrient: { select: { title: true } } },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      db.recipes.findMany({
        where: {
          isPublished: true,
          imageUrl: { not: null },
          RecipeCategories: { slug: { in: ["veg", "vegan"] } },
          OR: [
            { recipeSeasons: { title: "Summer" } },
            { recipeSeasonTags: { some: { season: { title: "Summer" } } } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          metaSlug: true,
          imageUrl: true,
          RecipeCategories: { select: { name: true } },
          recipeCookingTime: {
            select: { prepTime: true, cookTime: true, restTime: true },
          },
          recipeNutrient: {
            where: { nutrient: { isPublished: true } },
            select: { nutrient: { select: { title: true } } },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      db.cuisines.findMany({
        where: {
          isPublished: true,
          recipeCuisine: {
            some: { recipe: { isPublished: true, imageUrl: { not: null } } },
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          recipeCuisine: {
            where: { recipe: { isPublished: true, imageUrl: { not: null } } },
            select: {
              recipe: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  metaSlug: true,
                  imageUrl: true,
                  RecipeCategories: { select: { name: true } },
                  recipeCookingTime: {
                    select: {
                      prepTime: true,
                      cookTime: true,
                      restTime: true,
                    },
                  },
                  recipeNutrient: {
                    where: { nutrient: { isPublished: true } },
                    select: { nutrient: { select: { title: true } } },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      }),
      db.recipes.findMany({
        where: {
          isPublished: true,
          imageUrl: { not: null },
          RecipeCategories: { slug: { in: ["veg", "vegan"] } },
          OR: [
            { title: { contains: "paneer" } },
            {
              recipeIngredients: {
                some: { ingredient: { name: { contains: "paneer" } } },
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          metaSlug: true,
          imageUrl: true,
          RecipeCategories: { select: { name: true } },
          recipeCookingTime: {
            select: { prepTime: true, cookTime: true, restTime: true },
          },
          recipeNutrient: {
            where: { nutrient: { isPublished: true } },
            select: { nutrient: { select: { title: true } } },
            take: 1,
          },
        },
        orderBy: { views: "desc" },
        take: 6,
      }),
      db.recipeCategories.findMany({
        where: {
          isPublished: true,
          recipe: { some: { isPublished: true, imageUrl: { not: null } } },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          recipe: {
            where: { isPublished: true, imageUrl: { not: null } },
            select: {
              id: true,
              title: true,
              slug: true,
              metaSlug: true,
              imageUrl: true,
              RecipeCategories: { select: { name: true } },
              recipeCookingTime: {
                select: { prepTime: true, cookTime: true, restTime: true },
              },
              recipeNutrient: {
                where: { nutrient: { isPublished: true } },
                select: { nutrient: { select: { title: true } } },
                take: 1,
              },
            },
            orderBy: { views: "desc" },
            take: 10,
          },
        },
        orderBy: { position: "asc" },
      }),
      db.post.findMany({
        where: { isPublished: true, imageUrl: { not: null } },
        select: {
          id: true,
          title: true,
          metaDescription: true,
          content: true,
          imageUrl: true,
          slug: true,
          metaSlug: true,
          updatedAt: true,
          PostCategory: {
            select: { category: { select: { title: true, slug: true } } },
          },
          PostTag: {
            select: { tag: { select: { title: true, slug: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
    ]);
  let plannedDays: MealPlanDay[] = [];

  if (user?.isPersonalised) {
    try {
      const featuredMoments = ["Breakfast", "Lunch", "Dinner"];
      const sideOnlyTitle = /\b(roti|chapati|paratha|naan|puri|poori)\b/i;
      const selectFeaturedMeals = (
        mealPlan: Awaited<ReturnType<typeof getMealPlanFromS3>>,
      ): MealPlanMoment[] => {
        const mealTimeByTitle = new Map(
          (mealPlan?.mealTimes ?? []).map((mealTime) => [mealTime.title, mealTime]),
        );

        return featuredMoments.flatMap((label) => {
            const mealTime = mealTimeByTitle.get(label);
            const recipes = mealTime
              ? mealPlan?.mealsByTime[mealTime.slug] ?? []
              : [];
            const recipe =
              label === "Breakfast"
                ? recipes.find((item) => !sideOnlyTitle.test(item.title))
                : recipes.find((item) =>
                      item.recipeRecipeType?.some(
                        ({ recipeType }) => recipeType.title === "Cooked Vegetable",
                      ),
                    ) ??
                  recipes.find((item) =>
                    item.recipeRecipeType?.some(({ recipeType }) =>
                      ["Protein", "Vegetable Salad"].includes(recipeType.title),
                    ),
                  );
            return recipe
              ? [
                  {
                    label,
                    recipe: {
                      id: recipe.id,
                      title: recipe.title,
                      slug: recipe.slug,
                      metaSlug: recipe.metaSlug,
                      imageUrl: recipe.imageUrl,
                      RecipeCategories: recipe.RecipeCategories,
                      recipeCookingTime: recipe.recipeCookingTime,
                      recipeNutrient: recipe.recipeNutrient ?? [],
                    },
                  },
                ]
              : [];
          });
      };
      const [todayPlan, tomorrowPlan] = await Promise.all([
        getMealPlanFromS3({ date: todayDate }),
        getMealPlanFromS3({ date: tomorrowDate }),
      ]);

      plannedDays = [
        {
          key: "today",
          tabLabel: "Today",
          dayLabel,
          meals: selectFeaturedMeals(todayPlan),
        },
        {
          key: "tomorrow",
          tabLabel: "Tomorrow",
          dayLabel: tomorrowLabel,
          meals: selectFeaturedMeals(tomorrowPlan),
        },
      ];
    } catch (error) {
      console.error("[HOME_PLANNED_MEALS]", error);
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kya Khayen",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?k={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const recipeListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured recipes from Kya Khayen",
    itemListElement: featuredRecipes.map((recipe, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/${recipe.metaSlug ? `${recipe.slug}-${recipe.metaSlug}` : recipe.slug}`,
      name: recipe.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeListSchema).replace(/</g, "\\u003c"),
        }}
      />
      <PremiumHomeHero
        catalogRecipeCount={catalogRecipeCount}
        videoUrls={heroVideoUrls}
      />
      <MembershipPromptModal />
      <HomePreferenceProvider defaultPreference="veg">
        <div className="home-page-body relative isolate overflow-hidden">
          <HomeFeaturedRecipes recipes={featuredRecipes} />
          <SeasonalSpotlight
            recipes={summerRecipes}
            editorialImage={seasonalEditorialImage}
          />
          <HomeCuisineExplorer
            cuisines={cuisineStories.map((cuisine) => ({
              id: cuisine.id,
              title: cuisine.title,
              slug: cuisine.slug,
              imageUrl:
                cuisine.imageUrl ||
                cuisine.recipeCuisine[0]?.recipe.imageUrl ||
                null,
              recipes: cuisine.recipeCuisine.map(({ recipe }) => recipe),
            }))}
          />
          <InterestSpotlight
            recipes={paneerRecipes}
            editorialImage={ingredientEditorialImage}
          />
          <HomeEditorialStories articles={homeArticles} />
          <HomeFoodPreference
            preferences={foodPreferenceStories.map((preference) => ({
              id: preference.id,
              name: preference.name,
              slug: preference.slug,
              imageUrl:
                preference.imageUrl || preference.recipe[0]?.imageUrl || null,
              recipes: preference.recipe,
            }))}
          />
          <MealPlanStory
            recipes={paneerRecipes.length > 0 ? paneerRecipes : summerRecipes}
            plannedDays={plannedDays}
            fallbackDayLabel={dayLabel}
            fallbackTomorrowLabel={tomorrowLabel}
          />
        </div>
      </HomePreferenceProvider>
    </>
  );
}
