import { MetadataRoute } from "next";
import { getArticles } from "@/actions/get-articles";
import { GetRecipes } from "@/actions/get-recipes";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.kyakhayen.com";
  const changeFrequency: ChangeFrequency = "daily";

  const recipes = await GetRecipes({});
  const articles = await getArticles({});

  const staticRoutes = [
    { url: "/", lastModified: "2024-12-14", changeFrequency: "daily" },
    { url: "/recipes", lastModified: "2024-12-14", changeFrequency: "daily" },
    { url: "/blog", lastModified: "2024-12-14", changeFrequency: "daily" },
    {
      url: "/about-us",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
    {
      url: "/contact-us",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
    { url: "/meal-plan", lastModified: "2024-12-14", changeFrequency: "daily" },
    {
      url: "/subscription-plans",
      lastModified: "2024-12-14",
      changeFrequency: "monthly",
    },
    {
      url: "/download-app",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
    {
      url: "/privacy-policy",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
    {
      url: "/auth/login",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
    {
      url: "/auth/register",
      lastModified: "2024-12-14",
      changeFrequency: "yearly",
    },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency as ChangeFrequency,
  }));

  const recipesRoutes = recipes.map((recipe) => {
    const combinedSlug = recipe.metaSlug
      ? `${recipe.slug}-${recipe.metaSlug}`
      : recipe.slug;

    const lastModifiedDate = new Date(recipe.updatedAt)
      .toISOString()
      .split("T")[0];

    return {
      url: `${baseUrl}/${combinedSlug}`,
      lastModified: lastModifiedDate,
      changeFrequency,
    };
  });

  const articlesRoutes = articles.map((article) => {
    const combinedSlug = article.metaSlug
      ? `${article.slug}-${article.metaSlug}`
      : article.slug;

    const lastModifiedDate = new Date(article.updatedAt)
      .toISOString()
      .split("T")[0];

    return {
      url: `${baseUrl}/${combinedSlug}`,
      lastModified: lastModifiedDate,
      changeFrequency,
    };
  });

  return [...staticRoutes, ...recipesRoutes, ...articlesRoutes];
}
