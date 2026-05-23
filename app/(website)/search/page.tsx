import { Metadata } from "next";

import { GetSearchedRecipes } from "@/actions/get-searched-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/no-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";

const meta = {
  title: "Search recipes | meal plans | Kya Khayen",
  description:
    "Search for recipes, meal plans and cooking ideas. Find dishes that fit your taste, cuisine preferences and available time.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/recipe-page.jpg`,
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recipes`,
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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/search`,
  },
};

const SearchPage = async (
  props: {
    params: Promise<{ recipeSlug: string }>;
    searchParams: Promise<{ k?: string }>;
  }
) => {
  const searchParams = await props.searchParams;
  const recipes = await GetSearchedRecipes({
    k: searchParams.k || undefined,
  });

  return (
    <div>
      <PageHeader title="Recipes" className="py-12" />
      <div className="py-12 bg-slate-100">
        <Container>
          {searchParams && (
            <div className="mb-4">
              <div className="flex items-center gap-x-2">
                {searchParams.k && (
                  <h1 className="text-3xl font-bold">
                    You search for {searchParams.k || ""}
                  </h1>
                )}
              </div>
            </div>
          )}
          {recipes.length === 0 && (
            <NoRecipesFound keyparam={searchParams.k || ""} />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {recipes.map((recipe, index) => (
              <div key={index} className="m-4">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default SearchPage;
