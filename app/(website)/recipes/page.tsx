import { Metadata } from "next";
import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/no-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";

const meta = {
  title: "Easy Recipes and Meal Ideas | Kya Khayen",
  description:
    "Discover easy recipes, dinner ideas, breakfast options, vegetarian dishes and practical meals for everyday cooking.",
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
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recipes`,
  },
};

const RecipePage = async (
  props: {
    params: Promise<{ recipeSlug: string }>;
    searchParams: Promise<{ k?: string; type?: string }>;
  }
) => {
  const searchParams = await props.searchParams;
  const recipes = await GetRecipes({
    searchSlug: searchParams.k || undefined,
    searchType: searchParams.type || undefined,
  });

  return (
    <div>
      <PageHeader title="Recipes" className="py-6" />
      <div className="bg-muted/35 py-12">
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
