import { Metadata } from "next";

import { GetSearchedRecipes } from "@/actions/get-searched-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/no-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";

const meta = {
  title: "Recipes - KyaKhayen: Explore 5 Billion+ Culinary Creations",
  description:
    "Explore diverse recipes at Kya Khayen. Find nutrition-packed meals, diet plans, and healthy recipes for every taste bud.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/recipe-page.jpg`,
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recipes`,

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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/search`,
  },
};

const SearchPage = async ({
  params,
  searchParams,
}: {
  params: { recipeSlug: string };
  searchParams: { k?: string };
}) => {
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
