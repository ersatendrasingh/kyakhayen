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

  const recipesRoutes = recipes.map((recipe) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: changeFrequency,
  }));

  const routes = [
    "",
    "/recipes",
    "/user/dashboard",
    "/user/profile",
    "/user/settings",
    "/auth/login",
    "/auth/register",
  ].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: changeFrequency,
  }));

  return [...routes, ...recipesRoutes];
}
