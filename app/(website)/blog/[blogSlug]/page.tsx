import { Metadata, ResolvingMetadata } from "next";

import { currentUser } from "@/lib/auth";

import RelatedRecipeSlider from "@/components/recipes/related-recipe-slider";
import RecipeSidebar from "@/components/recipes/recipe-sidebar";
import { db } from "@/lib/db";

import Container from "@/components/container";

import { PageHeader } from "@/components/page-header";
import { getArticleBySlug } from "@/actions/get-article";
import ArticleBannerCard from "@/components/blogs/article-banner-card";
import ArticleDetails from "@/components/blogs/article-details";
import ArticleSidebar from "@/components/blogs/article-sidebar";
import ArticleComments from "@/components/blogs/article-comments";

type Props = {
  params: { blogSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const blogSlug = params.blogSlug;

  // fetch data
  const recipe = await getArticleBySlug({
    blogSlug: blogSlug as string,
  });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const plainTextDescription = recipe?.content!.replace(/<[^>]*>/g, "");

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
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${blogSlug}`,
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
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${blogSlug}`,
    },
  };
}

const SingleArticlePage = async ({
  params,
  searchParams,
}: {
  params: { blogSlug: string };
  searchParams: { [category: string]: string | string[] | undefined };
}) => {
  const slug = params.blogSlug;

  const user = await currentUser();
  if (!user) {
    const userId = undefined;
  }

  const userId = user?.id;

  const article = await getArticleBySlug({ blogSlug: slug as string });

  if (!article) {
    throw new Error("Article not found");
  }

  const categories = await db.category.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (
    <div className="w-full bg-slate-100 pb-8">
      <PageHeader title="Articles" className="py-6" />
      <Container>
        <div className="flex flex-col md:flex-row ">
          <div className="w-full lg:w-4/6 mr-0 lg:mr-8">
            <ArticleBannerCard
              article={article}
              className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
            />
            <ArticleDetails article={article} />
            <ArticleComments
              comments={article?.articleComments}
              articleId={article.id}
            />
          </div>
          <div className="w-full lg:w-2/6">
            <ArticleSidebar categories={categories} />
          </div>
        </div>
        {/* <RelatedRecipeSlider relatedRecipes={relatedRecipes} /> */}
      </Container>
    </div>
  );
};

export default SingleArticlePage;
