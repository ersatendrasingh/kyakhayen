import { getRecipeBySlug } from "@/actions/get-recipe";
import { calculateRecipeNutrition } from "@/lib/calculate-recipe-nutrition";

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

interface SingleRecipeProps {
  recipeSlug: string;
  recipeMetaSlug: string | null;
}

const SingleRecipe = async ({
  recipeSlug,
  recipeMetaSlug,
}: SingleRecipeProps) => {
  const recipe = await getRecipeBySlug({ recipeSlug, recipeMetaSlug });

  if (!recipe) {
    return <RecipeNotFound />;
  }

  const recipeCategories = await db.recipeCategories.findMany({
    where: { isPublished: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  const recipeMealTimes = await db.mealTimes.findMany({
    where: { isPublished: true },
    orderBy: {
      title: "asc",
    },
  });

  const totalMinutes =
    (recipe.recipeCookingTime?.prepTime || 0) +
    (recipe.recipeCookingTime?.cookTime || 0) +
    (recipe.recipeCookingTime?.restTime || 0);

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

  const { totals: nutritionTotals, missingConversions } = calculateRecipeNutrition(
    recipe.recipeIngredients
  );
  const hasVerifiedNutrition =
    recipe.recipeIngredients.length > 0 &&
    recipe.recipeIngredients.every((item) => item.ingredient.isPublished) &&
    missingConversions.length === 0;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description:
      recipe.metaDescription ||
      recipe.description?.replace(/<[^>]*>/g, "").substring(0, 157) + "...",
    image: recipe.imageUrl,
    author: {
      "@type": "Person",
      name: "KyaKhayen",
    },
    datePublished: recipe.createdAt,
    prepTime: prepTime,
    cookTime: cookTime,
    totalTime: totalTime,
    recipeYield: "1 serving",
    recipeCategory: recipe.RecipeCategories?.name || "General",
    recipeCuisine: recipeCuisine || ["Global"],
    recipeIngredient: recipeIngredients || [],
    recipeInstructions: recipeMethods || [],
    ...(hasVerifiedNutrition
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            calories: `${nutritionTotals.calories.toFixed(2)} kcal`,
          },
        }
      : {}),
  };

  return (
    <div className="w-full bg-muted/35 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <Container>
        <div className="flex flex-col md:flex-row">
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

          <div className="w-full lg:w-2/6">
            <RecipeSidebar
              recipeCategories={recipeCategories}
              recipeMealTimes={recipeMealTimes}
            />
          </div>
        </div>

        <RelatedRecipeSlider recipeId={recipe.id} />
      </Container>
    </div>
  );
};

export default SingleRecipe;
