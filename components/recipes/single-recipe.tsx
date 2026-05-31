import { calculateRecipeNutrition } from "@/lib/calculate-recipe-nutrition";

import BannerCard from "@/components/recipes/banner-card";
import RecipeDetails from "@/components/recipes/recipe-details";

import RelatedRecipeSlider from "@/components/recipes/related-recipe-slider";
import RecipeSidebar from "@/components/recipes/recipe-sidebar";

import Container from "@/components/container";

import RecipeCommentSection from "@/components/recipes/recipe-comments-section";
import RecipeReviewsSection from "@/components/recipes/recipe-reviews-section";
import RecipeNotFound from "@/components/recipes/recipe-not-found";
import RecipeReactions from "@/components/recipes/recipe-reactions";
import RecipeCookingDock from "@/components/recipes/recipe-cooking-dock";
import { getPublicRelatedRecipes, getRecipeSidebarTaxonomy } from "@/lib/public-content";
import { recipeCollectionHref } from "@/lib/recipe-collection-url";
import { recipeContentUpdatedAt, recipePublishedAt } from "@/lib/recipe-publication";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  jsonLd,
  recipeHref,
  seoDescription,
  stripHtml,
} from "@/lib/seo";
import type { RecipeWithCategory } from "@/types/recipe";

interface SingleRecipeProps {
  recipe: RecipeWithCategory;
}

function recipeDescriptionFallback(recipe: RecipeWithCategory) {
  const cuisine = recipe.recipeCuisine?.[0]?.cuisine.title;
  const category = recipe.RecipeCategories?.name;
  const recipeType = recipe.recipeRecipeType?.[0]?.recipeType.title;
  const context = [cuisine, category, recipeType].filter(Boolean).join(", ");

  return `${recipe.title} recipe with ingredients and step-by-step cooking instructions${context ? ` for ${context.toLowerCase()} cooking` : ""}. Make it at home with Kya Khayen.`;
}

const SingleRecipe = async ({ recipe }: SingleRecipeProps) => {
  if (!recipe) return <RecipeNotFound />;

  const [{ recipeCategories, recipeMealTimes, recipeTypes }, relatedRecipes] =
    await Promise.all([
      getRecipeSidebarTaxonomy(),
      getPublicRelatedRecipes(recipe.id, recipe.recipeCategoriesId),
    ]);

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
    text: stripHtml(method.description || method.title),
    ...(method.imageUrl ? { image: absoluteUrl(method.imageUrl) } : {}),
  }));
  const approvedReviews = (recipe.Review || []).filter((review) => review.isPublished);
  const averageRating = approvedReviews.length
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) /
      approvedReviews.length
    : 0;
  const recipeUrl = absoluteUrl(recipeHref(recipe));

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
    "@id": `${recipeUrl}#recipe`,
    url: recipeUrl,
    mainEntityOfPage: recipeUrl,
    name: recipe.title,
    description: seoDescription(
      recipe.metaDescription,
      recipeDescriptionFallback(recipe),
    ),
    image: recipe.imageUrl ? [absoluteUrl(recipe.imageUrl)] : undefined,
    author: {
      "@type": "Organization",
      name: "KyaKhayen",
    },
    datePublished: recipePublishedAt(recipe),
    dateModified: recipeContentUpdatedAt(recipe),
    prepTime: prepTime,
    cookTime: cookTime,
    totalTime: totalTime,
    recipeYield: "1 serving",
    recipeCategory: recipe.RecipeCategories?.name || "General",
    recipeCuisine: recipeCuisine || ["Global"],
    recipeIngredient: recipeIngredients || [],
    recipeInstructions: recipeMethods || [],
    keywords: [
      recipe.title,
      `${recipe.title} recipe`,
      "easy recipe",
      "homemade recipe",
      recipe.RecipeCategories?.name,
      ...(recipe.recipeDietType ?? []).map(({ dietType }) => dietType.title),
      ...(recipe.recipeRecipeType ?? []).map(({ recipeType }) => recipeType.title),
      ...(recipe.recipeCuisine ?? []).map(({ cuisine }) => cuisine.title),
    ]
      .filter(Boolean)
      .join(", "),
    ...(approvedReviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: approvedReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: approvedReviews.slice(0, 8).map((review) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: review.user?.name || "Kya Khayen user",
            },
            datePublished: review.createdAt,
            reviewBody: review.comment,
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
    ...(hasVerifiedNutrition
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            calories: `${nutritionTotals.calories.toFixed(2)} kcal`,
          },
        }
      : {}),
  };
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Recipes", path: "/recipes" },
    {
      name: recipe.RecipeCategories?.name || "Recipe",
      path: recipe.RecipeCategories?.slug
        ? recipeCollectionHref(recipe.RecipeCategories.slug)
        : "/recipes",
    },
    { name: recipe.title, path: recipeHref(recipe) },
  ]);

  return (
    <div className="recipe-page-body relative w-full overflow-x-clip pb-28 pt-5 sm:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([jsonLdData, breadcrumbSchema]) }}
      />
      <Container>
        <BannerCard recipe={recipe} className="mb-8" />
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-8">
            <RecipeDetails recipe={recipe} />
            <RecipeReactions recipeId={recipe.id} />
            <RecipeReviewsSection
              recipeId={recipe.id}
              reviews={recipe?.Review || []}
            />
            <RecipeCommentSection
              recipeId={recipe.id}
              comments={recipe.recipeComments || []}
            />
          </div>

          <RecipeSidebar
            recipeCategories={recipeCategories}
            recipeMealTimes={recipeMealTimes}
            recipeTypes={recipeTypes}
          />
        </div>

        <div id="recipe-related-recipes" className="mt-12">
          <RelatedRecipeSlider recipes={relatedRecipes} />
        </div>
      </Container>
      <RecipeCookingDock
        title={recipe.title}
        defaultTimerMinutes={totalMinutes || 10}
      />
    </div>
  );
};

export default SingleRecipe;
