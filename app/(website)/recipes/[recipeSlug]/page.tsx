import { getRecipeBySlug } from "@/actions/get-recipe";

import BannerCard from "@/components/recipes/banner-card";
import RecipeDetails from "@/components/recipes/recipe-details";

import StickySidebar from "@/components/recipes/sticky-sidebar";
import { currentUser } from "@/lib/auth";
import { RecipeCategories, RecipeIngredients, Recipes } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { GetRecipes } from "@/actions/get-recipes";
import RelatedRecipeSlider from "@/components/recipes/related-recipe-slider";
import RecipeSidebar from "@/components/recipes/recipe-sidebar";
import { db } from "@/lib/db";
import { Metadata, ResolvingMetadata } from "next";

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

  return {
    title: recipe?.title,
    description: recipe?.description,
    keywords: [
      "nutrition diet plan",
      "meal plans for weight loss",
      "diet plan for weight loss",
      "weight loss diet plan for women",
      "healthy diet plans",
    ],
    openGraph: {
      images: [recipe?.imageUrl as string, ...previousImages],
    },
  };
}

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories;
  recipeIngredients: RecipeIngredients[];
};
const SingleRecipePage = async ({
  params,
  searchParams,
}: {
  params: { recipeSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
}) => {
  const slug = params.recipeSlug;

  const user = await currentUser();
  if (!user) {
    const userId = undefined;
  }

  const userId = user?.id;

  const relatedRecipes = await GetRecipes({});

  const recipe = await getRecipeBySlug({ recipeSlug: slug as string });

  if (!recipe) {
    throw new Error("Recipe not found");
  }
  const { id, title, imageUrl } = recipe;

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
      <div className=" flex flex-col lg:flex-row">
        <div className="w-full lg:w-4/6">
          <BannerCard
            recipe={recipe}
            className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
          />
          <RecipeDetails recipe={recipe} />
        </div>
        <div className="w-full lg:w-2/6 lg:pr-20">
          <RecipeSidebar
            recipeCategories={recipeCategories}
            recipeMealTimes={recipeMealTimes}
          />
        </div>
      </div>
      <RelatedRecipeSlider relatedRecipes={relatedRecipes} />
    </div>
  );
};

export default SingleRecipePage;
