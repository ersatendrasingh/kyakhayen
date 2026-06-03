import type { Metadata } from "next";
import { ArrowRight, CookingPot, Leaf, Sparkles, Sun, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GetRecipeListingPage } from "@/actions/get-recipe-listing";
import Container from "@/components/container";
import type { RecipeCardRecipe } from "@/components/recipes/recipe-card";
import RecipeResultsFeed from "@/components/recipes/recipe-results-feed";
import { shouldServeDirectMediaImage } from "@/lib/direct-media-image";
import { recipeCollectionHref } from "@/lib/recipe-collection-url";
import {
  breadcrumbJsonLd,
  buildSeoMetadata,
  itemListJsonLd,
  jsonLd,
  recipeHref,
} from "@/lib/seo";

const meta = {
  title: "Easy Recipes and Meal Ideas | Kya Khayen",
  description:
    "Browse easy recipes, healthy dinner ideas, quick breakfast options, vegetarian dishes, vegan meals and practical everyday cooking inspiration.",
  image: "/meta-images/recipe-page.jpg",
};

export type RecipeSearchParams = { k?: string; type?: string; food?: string };

const discoveryLinks = [
  {
    label: "All recipes",
    href: "/recipes",
    key: undefined,
    icon: CookingPot,
  },
  {
    label: "North Indian",
    href: "/recipes/north-indian",
    key: "north-indian",
    icon: UtensilsCrossed,
  },
  {
    label: "Vegetarian",
    href: "/recipes/veg",
    key: "veg",
    icon: Leaf,
  },
  {
    label: "Summer fresh",
    href: "/recipes/summer",
    key: "summer",
    icon: Sun,
  },
  {
    label: "Smoothies",
    href: "/recipes/drink-smoothies",
    key: "drink-smoothies",
    icon: Sparkles,
  },
];

const knownLabels: Record<string, string> = {
  veg: "Vegetarian",
  "non-veg": "Non Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
  pescetarian: "Pescetarian",
  "north-indian": "North Indian",
  "south-indian": "South Indian",
  "mid-morning": "Mid Morning",
  beveragesmoothie: "Drink",
  healthy: "Healthy",
  "drink-teas": "Tea",
  "drink-infusions": "Infusion",
  "drink-juices": "Juice",
  "drink-coolers-sharbat": "Cooler & Sharbat",
  "drink-smoothies": "Smoothie",
  "drink-shakes": "Shake",
  "drink-lassi-buttermilk": "Lassi & Buttermilk",
  "drink-detox": "Detox Drink",
  "drink-hot-sips": "Hot Sip",
  desserts: "Dessert",
  "cooked-vegetable": "Cooked Vegetable",
  "vegetable-salad": "Vegetable Salad",
  "fruit-salad": "Fruit Salad",
  chutneydips: "Chutney and Dips",
  curdraita: "Curd and Raita",
};

function collectionLabel(slug?: string) {
  if (!slug) return null;

  return (
    knownLabels[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

type HeroContent = {
  eyebrow: string;
  intro: string;
  highlights: string[];
  searchQuery: string;
};

const heroCopyBySlug: Record<string, HeroContent> = {
  summer: {
    eyebrow: "Seasonal recipe ideas",
    intro:
      "Explore summer recipes for warm days: cooling drinks, smoothie recipes, light vegetarian meals, fresh salads and easy dinner ideas that keep everyday cooking bright.",
    highlights: ["summer recipes", "cooling drinks", "smoothie recipes", "light dinner ideas"],
    searchQuery: "summer recipes",
  },
  veg: {
    eyebrow: "Vegetarian recipe ideas",
    intro:
      "Browse vegetarian recipes for breakfast, lunch and dinner with colourful vegetables, comforting grains, paneer ideas and healthy meal inspiration for everyday cooking.",
    highlights: ["vegetarian recipes", "healthy meals", "dinner ideas", "breakfast recipes"],
    searchQuery: "vegetarian recipes",
  },
  vegan: {
    eyebrow: "Vegan recipe ideas",
    intro:
      "Find vegan recipes built around vegetables, lentils, grains, fruits, smoothies and dairy-free meals for simple plant-based cooking through the week.",
    highlights: ["vegan recipes", "plant-based meals", "healthy dinner", "smoothies"],
    searchQuery: "vegan recipes",
  },
  "non-veg": {
    eyebrow: "Protein-rich recipe ideas",
    intro:
      "Explore chicken recipes, meat recipes and protein-rich dinner ideas with clear steps, real food images and satisfying meals for home cooking.",
    highlights: ["chicken recipes", "protein rich meals", "dinner recipes", "easy recipes"],
    searchQuery: "chicken dinner",
  },
  eggetarian: {
    eyebrow: "Egg recipe ideas",
    intro:
      "Discover egg recipes for breakfast, snacks and quick dinners, from protein-rich plates to simple homemade meals you can cook without fuss.",
    highlights: ["egg recipes", "protein breakfast", "quick dinner", "easy snacks"],
    searchQuery: "egg recipes",
  },
  pescetarian: {
    eyebrow: "Fish and seafood ideas",
    intro:
      "Browse fish recipes and pescetarian meals with bright flavours, healthy dinner ideas and simple cooking steps for seafood-friendly meal planning.",
    highlights: ["fish recipes", "seafood meals", "healthy dinner", "pescetarian recipes"],
    searchQuery: "fish recipes",
  },
  beveragesmoothie: {
    eyebrow: "Healthy drink ideas",
    intro:
      "Find smoothie recipes, juice recipes and cooling beverages for breakfast, summer afternoons and refreshing everyday drinks.",
    highlights: ["smoothie recipes", "juice recipes", "healthy drinks", "breakfast smoothies"],
    searchQuery: "smoothie recipes",
  },
  healthy: {
    eyebrow: "Everyday healthy recipes",
    intro:
      "Browse healthy recipes selected from clean nutrition and cooking tags: lighter meals, salads, soups, protein-rich dishes, smoothies and vegetable-forward plates without deep-fried snacks or heavy desserts.",
    highlights: ["healthy recipes", "lighter meals", "high protein", "fiber rich"],
    searchQuery: "healthy recipes",
  },
  "drink-teas": {
    eyebrow: "Tea recipes",
    intro:
      "Browse tea recipes and chai-style drinks tagged specifically as teas, separate from smoothies, juices and herbal infusions.",
    highlights: ["tea recipes", "chai ideas", "warm drinks", "low calorie sips"],
    searchQuery: "tea recipes",
  },
  "drink-infusions": {
    eyebrow: "Herbal infusion recipes",
    intro:
      "Explore herbal infusions and infused drinks tagged separately from smoothies and regular teas, with tulsi, ginger, mint and spice-led sips.",
    highlights: ["infusion drinks", "herbal sips", "tulsi drinks", "warm infusions"],
    searchQuery: "infusion drinks",
  },
  "drink-juices": {
    eyebrow: "Fresh juice recipes",
    intro:
      "Find fruit juices and vegetable juices only, kept separate from aam panna, sharbat, lemonade, spiced waters and other soft drinks.",
    highlights: ["juice recipes", "vegetable juices", "fruit juices", "fresh juices"],
    searchQuery: "juice recipes",
  },
  "drink-coolers-sharbat": {
    eyebrow: "Cooler and sharbat recipes",
    intro:
      "Browse aam panna, sharbat, lemonade, barley water, cumin drinks, mocktails and other refreshing soft drinks outside the juice collection.",
    highlights: ["aam panna", "sharbat recipes", "lemonade", "spiced waters"],
    searchQuery: "cooler sharbat recipes",
  },
  "drink-smoothies": {
    eyebrow: "Smoothie recipes",
    intro:
      "Browse smoothie recipes only, grouped from smoothie tags so teas, infusions and juices stay out of this collection.",
    highlights: ["smoothie recipes", "breakfast smoothies", "fruit smoothies", "oats smoothies"],
    searchQuery: "smoothie recipes",
  },
  "drink-shakes": {
    eyebrow: "Shake recipes",
    intro:
      "Explore milk shakes, soy shakes and fruit shakes grouped separately from smoothies, teas and juices.",
    highlights: ["shake recipes", "milk shakes", "soy shakes", "fruit shakes"],
    searchQuery: "shake recipes",
  },
  "drink-lassi-buttermilk": {
    eyebrow: "Lassi and buttermilk",
    intro:
      "Browse curd-based drinks, lassi recipes, buttermilk and chaas-style beverages for cooling everyday meals.",
    highlights: ["lassi recipes", "buttermilk", "chaas", "curd drinks"],
    searchQuery: "lassi buttermilk recipes",
  },
  "drink-detox": {
    eyebrow: "Detox drink recipes",
    intro:
      "Find detox drinks, alkaline drinks and light cleansing beverages grouped by dedicated drink tags.",
    highlights: ["detox drinks", "alkaline drinks", "light beverages", "cooling sips"],
    searchQuery: "detox drink recipes",
  },
  "drink-hot-sips": {
    eyebrow: "Hot sip recipes",
    intro:
      "Browse warm hot sips with gentle spices, herbs and fruit-led flavours, kept separate from teas and infusions.",
    highlights: ["hot sips", "warm drinks", "spiced sips", "comfort drinks"],
    searchQuery: "hot sip recipes",
  },
  desserts: {
    eyebrow: "Indian dessert recipes",
    intro:
      "Browse Indian dessert recipes, mithai favourites, festive sweets, kheer, halwa, ladoo, kulfi and celebration-ready sweet dishes with clear steps and real food images.",
    highlights: ["Indian dessert recipes", "mithai sweets", "festival desserts", "kheer and halwa"],
    searchQuery: "Indian dessert recipes",
  },
};

function buildHeroContent({
  heading,
  slug,
  type,
}: {
  heading: string;
  slug?: string;
  type?: string;
}): HeroContent {
  if (slug && heroCopyBySlug[slug]) return heroCopyBySlug[slug];

  if (type === "mealTime" && slug) {
    const meal = collectionLabel(slug) || heading.replace(/\s+Recipes$/i, "");
    const mealLower = meal.toLowerCase();
    return {
      eyebrow: `${meal} recipe ideas`,
      intro: `Browse ${mealLower} recipes with easy ingredients, clear cooking steps, healthy meal ideas and fresh inspiration for your daily routine.`,
      highlights: [`${mealLower} recipes`, "easy recipes", "healthy meals", "quick ideas"],
      searchQuery: `${mealLower} recipes`,
    };
  }

  if (type === "cuisine" && slug) {
    const cuisine = collectionLabel(slug) || heading.replace(/\s+Recipes$/i, "");
    const cuisineLower = cuisine.toLowerCase();
    return {
      eyebrow: `${cuisine} recipe ideas`,
      intro: `Explore ${cuisineLower} recipes with real dish images, simple cooking steps, regional flavours and practical meal ideas for home kitchens.`,
      highlights: [`${cuisineLower} recipes`, "regional recipes", "easy meals", "dinner ideas"],
      searchQuery: `${cuisineLower} recipes`,
    };
  }

  if (type === "recipeType" && slug) {
    const recipeType = collectionLabel(slug) || heading.replace(/\s+Recipes$/i, "");
    const typeLower = recipeType.toLowerCase();
    return {
      eyebrow: `${recipeType} recipe ideas`,
      intro: `Discover ${typeLower} recipes with beautiful food images, everyday ingredients, easy cooking steps and fresh meal inspiration.`,
      highlights: [`${typeLower} recipes`, "easy recipes", "healthy ideas", "meal inspiration"],
      searchQuery: `${typeLower} recipes`,
    };
  }

  return {
    eyebrow: "Curated recipe kitchen",
    intro:
      "Browse easy recipes, healthy dinner ideas, quick breakfast options, vegetarian dishes, vegan meals and global flavours for everyday home cooking.",
    highlights: ["easy recipes", "healthy recipes", "dinner ideas", "breakfast recipes"],
    searchQuery: "easy recipes",
  };
}

function pickHeroRecipes(recipes: RecipeCardRecipe[]) {
  const imageRecipes = recipes.filter((recipe) => recipe.imageUrl);

  return [...imageRecipes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
}

export function buildRecipePageMetadata(
  query: RecipeSearchParams,
  canonicalPath?: string,
): Metadata {
  const label = collectionLabel(query.k);
  const foodLabel =
    query.food && query.food !== query.k ? collectionLabel(query.food) : null;
  const collectionTitle = label
    ? `${foodLabel ? `${foodLabel} ` : ""}${label} Recipes`
    : "Easy Recipes and Meal Ideas";
  const title = `${collectionTitle} | Kya Khayen`;
  const description = label
    ? `Discover ${collectionTitle.toLowerCase()} with beautiful images, cooking inspiration and everyday dishes from Kya Khayen.`
    : meta.description;
  const queryString = new URLSearchParams();

  if (query.k) queryString.set("k", query.k);
  if (query.type) queryString.set("type", query.type);
  if (query.food) queryString.set("food", query.food);
  const path =
    canonicalPath ||
    (query.k && query.type && !query.food
      ? recipeCollectionHref(query.k)
      : `/recipes${queryString.size ? `?${queryString.toString()}` : ""}`);
  const shouldNoIndex = Boolean(query.k && !query.type && !query.food);

  return buildSeoMetadata({
    title,
    description,
    path,
    image: meta.image,
    imageAlt: title,
    noIndex: shouldNoIndex,
    keywords: [
      collectionTitle,
      "easy recipes",
      "healthy recipes",
      "quick recipes",
      "dinner ideas",
      "breakfast recipes",
      "vegetarian recipes",
      "vegan recipes",
      "meal ideas",
    ],
  });
}

export async function renderRecipeListingPage({
  searchParams,
  canonicalPath,
}: {
  searchParams: RecipeSearchParams;
  canonicalPath?: string;
}) {
  const initialPage = await GetRecipeListingPage({
    searchSlug: searchParams.k || undefined,
    searchType: searchParams.type || undefined,
    foodPreferenceSlug: searchParams.food || undefined,
  });
  const collection = collectionLabel(searchParams.k);
  const foodLabel =
    searchParams.food && searchParams.food !== searchParams.k
      ? collectionLabel(searchParams.food)
      : null;
  const heading = collection
    ? `${foodLabel ? `${foodLabel} ` : ""}${collection} Recipes`
    : "Recipes for every craving";
  const intro = collection
    ? `Discover ${heading.toLowerCase()} with real food imagery, clear steps and everyday cooking ideas.`
    : "A growing kitchen of beautiful recipes, global flavours and meal ideas selected for real everyday cooking.";
  const heroContent = buildHeroContent({
    heading,
    slug: searchParams.k,
    type: searchParams.type,
  });
  const heroRecipes = pickHeroRecipes(initialPage.recipes);
  const heroRecipeCountLabel = initialPage.nextCursor
    ? `${initialPage.recipes.length}+`
    : String(initialPage.recipes.length);
  const queryString = new URLSearchParams();
  if (searchParams.k) queryString.set("k", searchParams.k);
  if (searchParams.type) queryString.set("type", searchParams.type);
  if (searchParams.food) queryString.set("food", searchParams.food);
  const pagePath =
    canonicalPath ||
    (searchParams.k && searchParams.type && !searchParams.food
      ? recipeCollectionHref(searchParams.k)
      : `/recipes${queryString.size ? `?${queryString.toString()}` : ""}`);
  const listingSchema = itemListJsonLd(
    heading,
    initialPage.recipes.map((recipe) => ({
      name: recipe.title,
      path: recipeHref(recipe),
      image: recipe.imageUrl,
    })),
  );
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Recipes", path: "/recipes" },
    ...(collection ? [{ name: heading, path: pagePath }] : []),
  ]);

  return (
    <div className="recipe-listing-surface relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_86%_4%,rgba(70,122,89,0.15),transparent_29rem),radial-gradient(circle_at_10%_0%,rgba(206,157,76,0.16),transparent_25rem),linear-gradient(180deg,#fffaf1_0%,#f8efe3_58%,#fffaf2_100%)] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([listingSchema, breadcrumbSchema]) }}
      />
      <section className="relative overflow-hidden border-b border-[#eadbc7] py-10 sm:py-14 lg:py-16 dark:border-white/10">
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[44%] bg-[radial-gradient(circle_at_50%_38%,rgba(234,184,89,0.22),transparent_22rem),radial-gradient(circle_at_76%_72%,rgba(61,100,73,0.18),transparent_19rem)] lg:block" />
        <Container>
          <div className="relative grid items-center gap-9 lg:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.72fr)] lg:gap-12">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a67636] dark:text-[#ddb66e]">
                <Sparkles className="size-3.5" />
                {heroContent.eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#30251d] sm:text-5xl dark:text-[#eef3ed]">
                {heading}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#726255] sm:text-base dark:text-[#a6b6ae]">
                {heroContent.intro || intro}
              </p>
              <div className="mt-5 flex max-w-2xl flex-wrap gap-2">
                {heroContent.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-[#e5d4bc] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#6d5946] dark:border-white/10 dark:bg-white/6 dark:text-[#dbe5df]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/search?k=${encodeURIComponent(heroContent.searchQuery)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#b63325] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(176,51,38,0.8)] transition hover:bg-[#9e291e]"
                >
                  Explore related recipes <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 rounded-full border border-[#dfc49b] bg-white/72 px-5 py-3 text-sm font-semibold text-[#4e3d31] transition hover:border-[#cda66b] dark:border-white/14 dark:bg-transparent dark:text-[#edf2ec]"
                >
                  Browse all recipes
                </Link>
              </div>
            </div>

            {heroRecipes.length > 0 && (
              <div className="relative min-h-[330px] sm:min-h-[390px] lg:min-h-[430px]" aria-label={`${heading} recipe images`}>
                {heroRecipes[0] && (
                  <Link
                    href={recipeHref(heroRecipes[0])}
                    className="group absolute left-0 top-2 h-[74%] w-[68%] overflow-hidden rounded-[1.55rem] border border-white/70 bg-[#efe0c8] shadow-[0_24px_60px_-36px_rgba(49,31,18,0.68)]"
                  >
                    <Image
                      src={heroRecipes[0].imageUrl as string}
                      alt={`${heroRecipes[0].title} recipe`}
                      fill
                      priority
                      unoptimized={shouldServeDirectMediaImage(heroRecipes[0].imageUrl)}
                      sizes="(max-width: 1024px) 58vw, 390px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1b120d]/82 to-transparent p-4 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f4d397]">Fresh pick</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold sm:text-base">{heroRecipes[0].title}</p>
                    </div>
                  </Link>
                )}
                {heroRecipes[1] && (
                  <Link
                    href={recipeHref(heroRecipes[1])}
                    className="group absolute right-0 top-0 h-[45%] w-[43%] overflow-hidden rounded-[1.25rem] border-4 border-[#fff8eb] bg-[#efe0c8] shadow-[0_20px_50px_-34px_rgba(49,31,18,0.72)]"
                  >
                    <Image
                      src={heroRecipes[1].imageUrl as string}
                      alt={`${heroRecipes[1].title} recipe`}
                      fill
                      unoptimized={shouldServeDirectMediaImage(heroRecipes[1].imageUrl)}
                      sizes="(max-width: 1024px) 36vw, 250px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </Link>
                )}
                {heroRecipes[2] && (
                  <Link
                    href={recipeHref(heroRecipes[2])}
                    className="group absolute bottom-6 right-6 h-[40%] w-[48%] overflow-hidden rounded-[1.35rem] border-4 border-[#fff8eb] bg-[#efe0c8] shadow-[0_20px_52px_-34px_rgba(49,31,18,0.72)]"
                  >
                    <Image
                      src={heroRecipes[2].imageUrl as string}
                      alt={`${heroRecipes[2].title} recipe`}
                      fill
                      unoptimized={shouldServeDirectMediaImage(heroRecipes[2].imageUrl)}
                      sizes="(max-width: 1024px) 42vw, 275px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="absolute bottom-0 left-[18%] rounded-full border border-[#ead8ba] bg-[#fffaf0]/92 px-4 py-2 text-xs font-semibold text-[#5d4a3b] shadow-[0_14px_35px_-28px_rgba(49,31,18,0.7)] backdrop-blur">
                  {heroRecipeCountLabel} recipe ideas
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="border-b border-[#eadbc7]/70 bg-[#fffdf8]/56 py-5 backdrop-blur dark:border-white/8 dark:bg-[#0c1c17]/40">
        <Container>
          <nav className="home-hide-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Recipe collections">
            {discoveryLinks.map(({ label, href, key, icon: Icon }) => {
              const active = key === searchParams.k || (!key && !searchParams.k);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-[#193a2f] bg-[#193a2f] text-white dark:border-[#dbb56c] dark:bg-[#dbb56c] dark:text-[#13231c]"
                      : "border-[#e5d7c1] bg-white/72 text-[#5e4d40] hover:border-[#d4ac6d] dark:border-white/10 dark:bg-[#122921] dark:text-[#d7e0da]"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </section>

      <section className="pt-8 sm:pt-10">
        <Container>
          <div className="flex flex-col gap-5 rounded-[1.6rem] border border-[#e5d4bc] bg-[#fffdf8]/84 p-5 shadow-[0_18px_44px_-34px_rgba(61,39,18,0.38)] sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-white/10 dark:bg-[#10241e]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.23em] text-[#a67636] dark:text-[#ddb66e]">
                <Sparkles className="size-3.5" /> Meal planning
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#30251d] sm:text-2xl dark:text-[#eef3ed]">
                Found dishes you like? Build your own table.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#726255] dark:text-[#a6b6ae]">
                Choose food style, cuisines and cooking comfort, then continue
                with membership when you want ongoing planning access.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/meal-plan/create"
                className="inline-flex items-center gap-2 rounded-full bg-[#b63325] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9e291e]"
              >
                Create meal plan <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/subscription-plans"
                className="inline-flex items-center gap-2 rounded-full border border-[#dfc49b] bg-white px-5 py-3 text-sm font-semibold text-[#4e3d31] transition hover:border-[#cda66b] dark:border-white/14 dark:bg-transparent dark:text-[#edf2ec]"
              >
                Membership
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <div className="py-10 sm:py-12">
        <Container>
          <RecipeResultsFeed
            key={[
              searchParams.k || "all",
              searchParams.type || "all",
              searchParams.food || "all",
            ].join(":")}
            initialRecipes={initialPage.recipes}
            initialCursor={initialPage.nextCursor}
            filters={{
              searchSlug: searchParams.k || undefined,
              searchType: searchParams.type || undefined,
              foodPreferenceSlug: searchParams.food || undefined,
            }}
            emptyKey={searchParams.k}
            heading={collection ? `Explore ${heading}` : "Browse the full collection"}
          />
        </Container>
      </div>
    </div>
  );
}
