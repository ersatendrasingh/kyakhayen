import { Metadata, ResolvingMetadata } from "next";
import { getRecipeBySlug } from "@/actions/get-recipe";

import BannerCard from "@/components/recipes/banner-card";
import RecipeDetails from "@/components/recipes/recipe-details";

import RelatedRecipeSlider from "@/components/recipes/related-recipe-slider";
import RecipeSidebar from "@/components/recipes/recipe-sidebar";
import { db } from "@/lib/db";

import Container from "@/components/container";

import RecipeCommentSection from "@/components/recipes/recipe-comments-section";
import RecipeReviewsSection from "@/components/recipes/recipe-reviews-section";
import RecipeShareSection from "@/components/recipes/recipe-share-section";
import RecipeNotFound from "@/components/recipes/recipe-not-found";
import Head from "next/head";

type Props = {
  params: { recipeSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const recipeSlug = params.recipeSlug;

  // Fetch data
  const recipe = await getRecipeBySlug({
    recipeSlug: recipeSlug as string,
  });

  if (!recipe) {
    return {
      title: "Recipe Not Found - KyaKhayen",
      description: "The recipe you are looking for does not exist.",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const plainTextDescription = recipe?.description!.replace(/<[^>]*>/g, "");
  const metaDescription = plainTextDescription!.substring(0, 160);

  return {
    title: `${recipe?.title} - KyaKhayen`,
    description: metaDescription,
    openGraph: {
      title: recipe?.title,
      description: metaDescription,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipeSlug}`,
      type: "article",
      images: [recipe?.imageUrl as string, ...previousImages],
    },
    twitter: {
      title: recipe?.title,
      description: metaDescription,
      images: [recipe?.imageUrl as string, ...previousImages],
      card: "summary_large_image",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipeSlug}`,
    },
  };
}

const SingleRecipePage = async ({
  params,
}: {
  params: { recipeSlug: string };
}) => {
  const slug = params.recipeSlug;

  const recipe = await getRecipeBySlug({ recipeSlug: slug });

  if (!recipe) {
    // Render the RecipeNotFound component for missing recipes
    return <RecipeNotFound />;
  }

  const recipeCategories = await db.recipeCategories.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const recipeMealTimes = await db.mealTimes.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const totalMinutes =
    (recipe.recipeCookingTime?.prepTime || 0) +
    (recipe.recipeCookingTime?.cookTime || 0) +
    (recipe.recipeCookingTime?.restTime || 0);

  // Convert minutes to ISO 8601 duration format
  const formatTime = (minutes: number) => `PT${minutes}M`;

  const prepTime = formatTime(recipe.recipeCookingTime?.prepTime || 0);
  const cookTime = formatTime(recipe.recipeCookingTime?.cookTime || 0);
  const totalTime = formatTime(totalMinutes);

  const recipeCuisine = recipe.recipeCuisine?.map((c) => c.cuisine.title);

  const recipeIngredients = recipe.recipeIngredients.map(
    (ingredient) => ingredient.ingredient.name
  );

  const recipeMethods = recipe.recipeMethods.map((method) => ({
    "@type": "HowToStep",
    name: method.title,
  }));

  const totalCalories = recipe.recipeIngredients.reduce(
    (acc, ingredient) => acc + (ingredient.ingredient.calories || 0),
    0
  );

  // JSON-LD structured data for Schema.org
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description?.replace(/<[^>]*>/g, ""),
    image: recipe.imageUrl,
    author: {
      "@type": "Person",
      name: "KyaKhayen",
    },
    datePublished: recipe.createdAt,
    prepTime: prepTime,
    cookTime: cookTime,
    totalTime: totalTime,
    recipeCategory: recipe.RecipeCategories || "General",
    recipeCuisine: recipeCuisine || ["Global"],
    recipeIngredient: recipeIngredients || [],
    recipeInstructions: recipeMethods || [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue:
        recipe.Review?.reduce((acc, review) => acc + review.rating, 0) || "0",
      reviewCount: recipe.Review?.length || "0",
    },
    nutrition: {
      "@type": "NutritionInformation",
      calories: totalCalories,
    },
  };

  return (
    <div className="w-full bg-slate-100 pb-8">
      <Head>
        {/* Injecting JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Head>
      <Container>
        <div className="flex flex-col md:flex-row">
          {/* Left section */}
          <div className="w-full lg:w-4/6 mr-0 lg:mr-8">
            <BannerCard
              recipe={recipe}
              className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
            />
            <RecipeDetails recipe={recipe} />
            <RecipeShareSection recipe={recipe} />
            <RecipeReviewsSection
              recipeId={recipe.id}
              reviews={recipe?.Review || []}
            />
            <RecipeCommentSection
              recipeId={recipe.id}
              comments={recipe.recipeComments || []}
            />
          </div>

          {/* Right section */}
          <div className="w-full lg:w-2/6">
            <RecipeSidebar
              recipeCategories={recipeCategories}
              recipeMealTimes={recipeMealTimes}
            />
          </div>
        </div>

        {/* Related recipes */}
        <RelatedRecipeSlider recipeId={recipe.id} />
      </Container>
    </div>
  );
};

export default SingleRecipePage;
