import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticles } from "@/actions/get-articles";
import { GetRecipes } from "@/actions/get-recipes";
import SingleRecipe from "@/components/recipes/single-recipe";
import SingleArticle from "@/components/blogs/single-article";
import { articleHref, buildSeoMetadata, recipeHref, seoDescription } from "@/lib/seo";
import { recipeContentUpdatedAt, recipePublishedAt } from "@/lib/recipe-publication";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  const recipes = await GetRecipes({});
  const blogs = await getArticles({});

  const recipe = recipes.find((r) => {
    const combinedSlug = r.metaSlug ? `${r.slug}-${r.metaSlug}` : r.slug;
    return combinedSlug === slug;
  });

  if (recipe) {
    const description = seoDescription(
      recipe.metaDescription,
      recipe.description || `${recipe.title} recipe with ingredients and cooking steps.`,
    );
    const recipeKeywords = [
      recipe.title,
      `${recipe.title} recipe`,
      "easy recipe",
      "homemade recipe",
      recipe.RecipeCategories?.name,
      ...(recipe.recipeCuisine ?? []).map(({ cuisine }) => cuisine.title),
      ...(recipe.recipeDietType ?? []).map(({ dietType }) => dietType.title),
      ...(recipe.recipeRecipeType ?? []).map(({ recipeType }) => recipeType.title),
    ].filter((value): value is string => Boolean(value));

    return buildSeoMetadata({
      title: recipe.metaTitle || `${recipe.title} Recipe | Kya Khayen`,
      description,
      path: recipeHref(recipe),
      image: recipe.imageUrl,
      imageAlt: `${recipe.title} recipe`,
      type: "article",
      publishedTime: recipePublishedAt(recipe),
      modifiedTime: recipeContentUpdatedAt(recipe),
      keywords: recipeKeywords,
    });
  }

  const blog = blogs.find((b) => {
    const combinedSlug = b.metaSlug ? `${b.slug}-${b.metaSlug}` : b.slug;
    return combinedSlug === slug;
  });
  if (blog) {
    const description = seoDescription(
      blog.metaDescription,
      blog.content || `${blog.title} from Kya Khayen.`,
    );
    const articleKeywords = [
      blog.title,
      "cooking tips",
      "food guide",
      ...blog.PostCategory.map(({ category }) => category.title),
      ...blog.PostTag.map(({ tag }) => tag.title),
    ].filter((value): value is string => Boolean(value));

    return buildSeoMetadata({
      title: blog.metaTitle || `${blog.title} | Kya Khayen`,
      description,
      path: articleHref(blog),
      image: blog.imageUrl,
      imageAlt: blog.title,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      keywords: articleKeywords,
    });
  }

  return buildSeoMetadata({
    title: "Page Not Found | Kya Khayen",
    description: "The Kya Khayen page you are looking for does not exist.",
    path: "/404",
    noIndex: true,
  });
}

export default async function SlugPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const { slug } = params;

  const recipes = await GetRecipes({});
  const blogs = await getArticles({});
  const recipe = recipes.find((r) => {
    const combinedSlug = r.metaSlug ? `${r.slug}-${r.metaSlug}` : r.slug;
    return combinedSlug === slug;
  });
  if (recipe) {
    return (
      <SingleRecipe recipeSlug={recipe.slug} recipeMetaSlug={recipe.metaSlug} />
    );
  }

  const blog = blogs.find((b) => {
    const combinedSlug = b.metaSlug ? `${b.slug}-${b.metaSlug}` : b.slug;
    return combinedSlug === slug;
  });
  if (blog) {
    return (
      <SingleArticle articleSlug={blog.slug} articleMetaSlug={blog.metaSlug} />
    );
  }

  return notFound();
}
