import { MetadataRoute } from "next";
import { getArticles } from "@/actions/get-articles";
import { GetRecipes } from "@/actions/get-recipes";
import { getPublishedRecipeCollectionRoutes } from "@/lib/recipe-collection-resolver";
import { recipeContentUpdatedAt } from "@/lib/recipe-publication";
import { absoluteUrl, articleHref, recipeHref } from "@/lib/seo";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const changeFrequency: ChangeFrequency = "daily";

  const recipes = await GetRecipes({});
  const articles = await getArticles({});
  const recipeCollections = await getPublishedRecipeCollectionRoutes();

  const staticRoutes = [
    { url: "/", lastModified: "2026-05-30", changeFrequency: "daily" },
    { url: "/recipes", lastModified: "2026-05-30", changeFrequency: "daily" },
    { url: "/blog", lastModified: "2026-05-30", changeFrequency: "daily" },
    {
      url: "/about-us",
      lastModified: "2026-05-30",
      changeFrequency: "yearly",
    },
    {
      url: "/contact-us",
      lastModified: "2026-05-30",
      changeFrequency: "yearly",
    },
    { url: "/meal-plan", lastModified: "2026-05-30", changeFrequency: "daily" },
    {
      url: "/subscription-plans",
      lastModified: "2026-05-30",
      changeFrequency: "monthly",
    },
    {
      url: "/download-app",
      lastModified: "2026-05-30",
      changeFrequency: "yearly",
    },
    {
      url: "/privacy-policy",
      lastModified: "2026-05-30",
      changeFrequency: "yearly",
    },
    {
      url: "/terms-and-conditions",
      lastModified: "2026-05-30",
      changeFrequency: "yearly",
    },
  ].map((route) => ({
    url: absoluteUrl(route.url),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency as ChangeFrequency,
  }));

  const recipesRoutes = recipes.map((recipe) => {
    const lastModifiedDate = new Date(recipeContentUpdatedAt(recipe))
      .toISOString()
      .split("T")[0];

    return {
      url: absoluteUrl(recipeHref(recipe)),
      lastModified: lastModifiedDate,
      changeFrequency,
    };
  });

  const articlesRoutes = articles.map((article) => {
    const lastModifiedDate = new Date(article.updatedAt)
      .toISOString()
      .split("T")[0];

    return {
      url: absoluteUrl(articleHref(article)),
      lastModified: lastModifiedDate,
      changeFrequency,
    };
  });

  const collectionRoutes = Array.from(
    new Map(recipeCollections.map((collection) => [collection.href, collection])).values(),
  ).map((collection) => ({
    url: absoluteUrl(collection.href),
    lastModified: "2026-05-30",
    changeFrequency,
  }));

  return [...staticRoutes, ...collectionRoutes, ...recipesRoutes, ...articlesRoutes];
}
