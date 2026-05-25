import { ArrowRight, Search, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  GetRecipeSearchSuggestions,
  GetSearchedRecipes,
} from "@/actions/get-searched-recipes";
import Container from "@/components/container";
import RecipeCard from "@/components/recipes/recipe-card";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.kyakhayen.com";

export const metadata: Metadata = {
  title: "Search Recipes by Ingredient, Cuisine or Craving | Kya Khayen",
  description:
    "Search recipes using ingredients, meal times, cuisines and cravings. Find paneer dishes, breakfast recipes, summer drinks and more.",
  alternates: { canonical: `${siteUrl}/search` },
  openGraph: {
    title: "Search Recipes by Ingredient, Cuisine or Craving | Kya Khayen",
    description: "Discover food by the words you naturally use.",
    url: `${siteUrl}/search`,
    type: "website",
    images: [{ url: `${siteUrl}/meta-images/recipe-page.jpg`, width: 1200, height: 630 }],
  },
};

const quickSearches = [
  "Paneer recipes",
  "Breakfast recipes",
  "Rajma",
  "North Indian dinner",
  "Summer smoothies",
  "Vegetarian snacks",
];

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) => {
  const { k = "" } = await searchParams;
  const query = k.trim();
  const [recipes, relatedSuggestions] = await Promise.all([
    GetSearchedRecipes({ k: query }),
    GetRecipeSearchSuggestions({ k: query }),
  ]);

  return (
    <div className="search-page-surface min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(217,156,61,0.14),transparent_28rem),linear-gradient(180deg,#fffaf2,#f8eee2)] pb-20">
      <section className="search-page-hero border-b border-[#eadbc8] bg-[#fffdf8]/78 py-9 sm:py-14">
        <Container>
          <div className="mx-auto max-w-[900px] text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a67636]">
              <Sparkles className="size-3.5" /> Smart recipe discovery
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#30251d] sm:text-5xl">
              Find food the way you think.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#746659] sm:text-base">
              Search from the header anytime, or jump into a popular craving below.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {quickSearches.map((term) => (
                <Link
                  key={term}
                  href={`/search?k=${encodeURIComponent(term)}`}
                  className="cursor-pointer rounded-full border border-[#e8d8c0] bg-white/72 px-4 py-2 text-xs font-medium text-[#695545] transition hover:border-[#d49b44] hover:text-primary"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-9 sm:py-12">
          {query ? (
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a67636]">
                  Search results
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#30251d] sm:text-3xl">
                  {recipes.length > 0
                    ? `${recipes.length} dishes for "${query}"`
                    : `Nothing found for "${query}"`}
                </h2>
                {recipes.length > 0 && (
                  <p className="mt-2 text-sm text-[#75675b]">
                    Ranked from related names, ingredients, cuisines and meal moments.
                  </p>
                )}
              </div>
              {relatedSuggestions.length > 0 && (
                <div className="flex max-w-xl flex-wrap gap-2 md:justify-end">
                  {relatedSuggestions.slice(0, 4).map((suggestion) => (
                    <Link
                      key={`${suggestion.kind}-${suggestion.label}`}
                      href={`/search?k=${encodeURIComponent(suggestion.query)}`}
                      className="rounded-full bg-[#f1e7d7] px-3.5 py-2 text-xs font-medium text-[#604a39] transition hover:text-primary"
                    >
                      {suggestion.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-9 rounded-[1.6rem] border border-[#ecddc9] bg-white/70 p-7 text-center">
              <Search className="mx-auto mb-4 size-6 text-[#bd8740]" />
              <h2 className="text-xl font-semibold">Start with a craving</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the search bar in the header or choose a craving to discover your next plate.
              </p>
            </div>
          )}

          {query && recipes.length === 0 && (
            <div className="rounded-[1.7rem] border border-[#ead9c3] bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-[#30251d]">
                Try a simpler food word
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#75675b]">
                Search by an ingredient like paneer, rajma or potato, or by a
                moment such as breakfast or dinner.
              </p>
              <Link
                href="/recipes"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Browse all recipes <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {recipes.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SearchPage;
