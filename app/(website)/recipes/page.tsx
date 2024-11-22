import { Metadata } from "next";
import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/no-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";

const meta = {
  title: "Healthy Recipes for Weight Loss | Easy Recipes and Diet Plans",
  description:
    "Become motivated with healthy recipes for weight loss, meal plans for women, pregnancy diet charts, dinner ideas, breakfast options, and diabetic meal plans.",
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
      <PageHeader title="Recipes" className="py-6" />
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
