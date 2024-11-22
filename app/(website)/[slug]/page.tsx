import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getArticles } from "@/actions/get-articles";
import { GetRecipes } from "@/actions/get-recipes";
import SingleRecipe from "@/components/recipes/single-recipe";
import SingleArticle from "@/components/blogs/single-article";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;

  const recipes = await GetRecipes({});
  const blogs = await getArticles({});

  const recipe = recipes.find((r) => {
    const combinedSlug = r.metaSlug ? `${r.slug}-${r.metaSlug}` : r.slug;
    return combinedSlug === slug;
  });

  if (recipe) {
    const previousImages = (await parent).openGraph?.images || [];
    const plainTextDescription = recipe.description?.replace(/<[^>]*>/g, "");
    const metaDescription = plainTextDescription!.substring(0, 160);

    return {
      title: recipe.metaTitle || `${recipe.title} - KyaKhayen`,
      description: recipe.metaDescription || metaDescription,
      openGraph: {
        title: recipe.metaTitle || recipe.title,
        description: recipe.metaDescription || metaDescription,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
        type: "article",
        images: [recipe.imageUrl!, ...previousImages],
      },
      twitter: {
        title: recipe.metaTitle || recipe.title,
        description: recipe.metaDescription || metaDescription,
        images: [recipe.imageUrl!, ...previousImages],
        card: "summary_large_image",
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recipe/${slug}`,
      },
    };
  }

  const blog = blogs.find((b) => {
    const combinedSlug = b.metaSlug ? `${b.slug}-${b.metaSlug}` : b.slug;
    return combinedSlug === slug;
  });
  if (blog) {
    const previousImages = (await parent).openGraph?.images || [];
    const plainTextDescription = blog.content?.replace(/<[^>]*>/g, "");
    const metaDescription = plainTextDescription!.substring(0, 160);

    return {
      title: blog.metaTitle || `${blog.title} - KyaKhayen`,
      description: blog.metaDescription || metaDescription,
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || metaDescription,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`,
        type: "article",
        images: [blog.imageUrl!, ...previousImages],
      },
      twitter: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || metaDescription,
        images: [blog.imageUrl!, ...previousImages],
        card: "summary_large_image",
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`,
      },
    };
  }

  return {
    title: "Page Not Found - KyaKhayen",
    description: "The page you are looking for does not exist.",
    openGraph: {
      title: "Page Not Found - KyaKhayen",
      description: "The page you are looking for does not exist.",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/404`,
      type: "website",
      images: [],
    },
    twitter: {
      title: "Page Not Found - KyaKhayen",
      description: "The page you are looking for does not exist.",
      card: "summary_large_image",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/404`,
    },
  };
}

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
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
