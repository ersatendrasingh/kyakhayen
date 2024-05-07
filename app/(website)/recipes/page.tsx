import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/np-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";
import { db } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes - KyaKhayen: Explore 5 Billion+ Culinary Creations",
  description:
    "Dive into a world of gastronomic delights with WhatToCook's Recipes page. Discover over 5 billion culinary creations, ranging from traditional family favorites to innovative fusion dishes.",
  keywords: [
    "kyakhayen",
    "kya khayen",
    "kya khayen recipes",
    "kya khayen healthy recipes",
    "nutrition diet plan",
    "meal plans for weight loss",
    "diet plan for weight loss",
    "weight loss diet plan for women",
    "healthy diet plans",
  ],
};
const RecipePage = async ({
  params,
  searchParams,
}: {
  params: { recipeSlug: string };
  searchParams: { k?: string; type?: string };
}) => {
  const recipes = await GetRecipes({
    searchSlug: searchParams.k || undefined,
    searchType: searchParams.type || undefined,
  });

  return (
    <div>
      <PageHeader title="Recipes" className="py-12" />
      <div className="py-12 bg-slate-100">
        <Container>
          {recipes.length === 0 && <NoRecipesFound key={searchParams.k!} />}
          {searchParams && (
            <div className="mb-4">
              <div className="flex items-center gap-x-2">
                {searchParams.k && (
                  <h1 className="text-3xl font-bold">
                    Recipes for {searchParams.k || ""}
                  </h1>
                )}
              </div>
            </div>
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

export default RecipePage;
