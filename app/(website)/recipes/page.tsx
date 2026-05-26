import type { Metadata } from "next";
import { ArrowRight, CookingPot, Leaf, Sparkles, Sun, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { GetRecipeListingPage } from "@/actions/get-recipe-listing";
import Container from "@/components/container";
import RecipeResultsFeed from "@/components/recipes/recipe-results-feed";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.kyakhayen.com";
const meta = {
  title: "Easy Recipes and Meal Ideas | Kya Khayen",
  description:
    "Discover easy recipes, dinner ideas, breakfast options, vegetarian dishes and practical meals for everyday cooking.",
  image: `${siteUrl}/meta-images/recipe-page.jpg`,
};

type RecipeSearchParams = { k?: string; type?: string; food?: string };

const discoveryLinks = [
  {
    label: "All recipes",
    href: "/recipes",
    key: undefined,
    icon: CookingPot,
  },
  {
    label: "North Indian",
    href: "/recipes?k=north-indian&type=cuisine",
    key: "north-indian",
    icon: UtensilsCrossed,
  },
  {
    label: "Vegetarian",
    href: "/recipes?k=veg&type=category",
    key: "veg",
    icon: Leaf,
  },
  {
    label: "Summer fresh",
    href: "/recipes?k=summer&type=season",
    key: "summer",
    icon: Sun,
  },
  {
    label: "Smoothies",
    href: "/recipes?k=beveragesmoothie&type=recipeType",
    key: "beveragesmoothie",
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
  beveragesmoothie: "Beverage and Smoothie",
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RecipeSearchParams>;
}): Promise<Metadata> {
  const query = await searchParams;
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
  const canonical = `${siteUrl}/recipes${queryString.size ? `?${queryString.toString()}` : ""}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: meta.image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title,
      description,
      images: [meta.image],
      card: "summary_large_image",
    },
  };
}

const RecipePage = async (props: {
  searchParams: Promise<RecipeSearchParams>;
}) => {
  const searchParams = await props.searchParams;
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
    : "A growing kitchen of beautiful recipes, regional favourites and meal ideas selected for real everyday cooking.";

  return (
    <div className="recipe-listing-surface relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_86%_4%,rgba(70,122,89,0.15),transparent_29rem),radial-gradient(circle_at_10%_0%,rgba(206,157,76,0.16),transparent_25rem),linear-gradient(180deg,#fffaf1_0%,#f8efe3_58%,#fffaf2_100%)] pb-20">
      <section className="relative overflow-hidden border-b border-[#eadbc7] py-10 sm:py-14 lg:py-16 dark:border-white/10">
        <div className="pointer-events-none absolute -right-16 top-8 size-72 rounded-full border border-[#d9be8f]/22" />
        <div className="pointer-events-none absolute -right-4 top-24 size-52 rounded-full border border-[#d9be8f]/18" />
        <Container>
          <div className="relative max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a67636] dark:text-[#ddb66e]">
              <Sparkles className="size-3.5" />
              Curated recipe kitchen
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#30251d] sm:text-5xl dark:text-[#eef3ed]">
              {heading}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#726255] sm:text-base dark:text-[#a6b6ae]">
              {intro}
            </p>
            <Link
              href="/search?k=paneer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#b63325] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(176,51,38,0.8)] transition hover:bg-[#9e291e]"
            >
              Discover by ingredient <ArrowRight className="size-4" />
            </Link>
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

      <div className="py-10 sm:py-12">
        <Container>
          <RecipeResultsFeed
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
};

export default RecipePage;
