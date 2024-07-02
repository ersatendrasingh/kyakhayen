import { Metadata, ResolvingMetadata } from "next";
import { getRecipeBySlug } from "@/actions/get-recipe";

import BannerCard from "@/components/recipes/banner-card";
import RecipeDetails from "@/components/recipes/recipe-details";

import RelatedRecipeSlider from "@/components/recipes/related-recipe-slider";
import RecipeSidebar from "@/components/recipes/recipe-sidebar";
import { db } from "@/lib/db";

import Container from "@/components/container";
import { getRelatedRecipes } from "@/actions/get-related-recipe";
import RecipeCommentSection from "@/components/recipes/recipe-comments-section";

type Props = {
  params: { recipeSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const recipeSlug = params.recipeSlug;

  // fetch data
  const recipe = await getRecipeBySlug({
    recipeSlug: recipeSlug as string,
  });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const plainTextDescription = recipe?.description!.replace(/<[^>]*>/g, "");

  // Meta description length limit set karna
  const metaDescription = plainTextDescription!.substring(0, 160);
  return {
    title: `${recipe?.title} - KyaKhayen`,
    description: metaDescription,
    keywords: [
      "kya khayen healthy recipes",
      "healthy diet plan for weight loss",
      "best diet plan for weight loss",
      "diet meal plans for weight loss",
      "healthy breakfast recipe for weight loss",
      "healthy diet plans",
    ],
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
  searchParams,
}: {
  params: { recipeSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
}) => {
  const slug = params.recipeSlug;

  const recipe = await getRecipeBySlug({ recipeSlug: slug as string });

  if (!recipe) {
    throw new Error("Recipe not found");
  }
  const relatedRecipes = await getRelatedRecipes({
    recipeId: recipe.id,
  });
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
  return (
    <div className="w-full bg-slate-100 pb-8">
      <Container>
        <div className="flex flex-col md:flex-row ">
          <div className="w-full lg:w-4/6 mr-0 lg:mr-8">
            <BannerCard
              recipe={recipe}
              className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
            />
            <RecipeDetails recipe={recipe} />
            <RecipeCommentSection
              recipeId={recipe.id}
              comments={recipe.recipeComments || []}
            />
          </div>
          <div className="w-full lg:w-2/6">
            <RecipeSidebar
              recipeCategories={recipeCategories}
              recipeMealTimes={recipeMealTimes}
            />
          </div>
        </div>
        <RelatedRecipeSlider relatedRecipes={relatedRecipes} />
      </Container>
    </div>
  );
};

export default SingleRecipePage;
