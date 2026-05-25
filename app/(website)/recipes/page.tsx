import type { Metadata } from "next";
import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { NoRecipesFound } from "@/components/recipes/no-recipe-found";
import RecipeCard from "@/components/recipes/recipe-card";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.kyakhayen.com";
const meta = {
  title: "Easy Recipes and Meal Ideas | Kya Khayen",
  description:
    "Discover easy recipes, dinner ideas, breakfast options, vegetarian dishes and practical meals for everyday cooking.",
  image: `${siteUrl}/meta-images/recipe-page.jpg`,
};

type RecipeSearchParams = { k?: string; type?: string; food?: string };

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

const RecipePage = async (
  props: {
    params: Promise<{ recipeSlug: string }>;
    searchParams: Promise<RecipeSearchParams>;
  }
) => {
  const searchParams = await props.searchParams;
  const recipes = await GetRecipes({
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
    : "Recipes";

  return (
    <div>
      <PageHeader title={heading} className="py-6" />
      <div className="bg-muted/35 py-12">
        <Container>
          {recipes.length === 0 && <NoRecipesFound key={searchParams.k!} />}
          {searchParams && (
            <div className="mb-4">
              <div className="flex items-center gap-x-2">
                {searchParams.k && (
                  <h1 className="text-3xl font-bold">
                    Explore {heading}
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
