import { getArticles } from "@/actions/get-articles";
import { GetRecipes } from "@/actions/get-recipes";
import { MetadataRoute } from "next";

type changeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const changeFrequency: changeFrequency = "daily";

  let recipes = await GetRecipes({});
  let articles = await getArticles({});

  const recipesRoutes = recipes.map((recipe) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: changeFrequency,
  }));

  const articlesRoutes = articles.map((article) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: changeFrequency,
  }));

  const routes = [
    "/",
    "/recipes",
    "/about-us",
    "/download-app",
    "/privacy-policy",
    "/auth/login",
    "/auth/register",
  ].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: changeFrequency,
  }));

  return [...routes, ...recipesRoutes, ...articlesRoutes];
}
