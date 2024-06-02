import { getArticles } from "@/actions/get-articles";
import ArticleCard from "@/components/blogs/article-card";
import { NoArticleFound } from "@/components/blogs/no-article-found";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

const meta = {
  title: "Delicious Recipes and Cooking Tips | Kyakahyen Blog",
  description:
    "Discover a wide variety of delicious recipes, cooking tips, and culinary inspiration on the Kyakahyen Blog. From quick and easy meals to gourmet dishes, find everything you need to elevate your home cooking experience.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/recipe-page.jpg`,
  keywords: [
    "kya khayen healthy recipes",
    "healthy diet plan for weight loss",
    "best diet plan for weight loss",
    "diet meal plans for weight loss",
    "healthy breakfast recipe for weight loss",
    "healthy diet plans",
  ],
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,

    type: "website",
    images: [
      {
        url: meta.image,
      },
    ],
  },
  twitter: {
    title: meta.title,
    description: meta.description,
    images: [meta.image],
    card: "summary_large_image",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,
  },
};
const BlogPage = async ({
  params,
  searchParams,
}: {
  params: { blogSlug: string };
  searchParams: { k?: string; type?: string };
}) => {
  const articles = await getArticles({
    searchSlug: searchParams.k || undefined,
    searchType: searchParams.type || undefined,
  });
  return (
    <div>
      <PageHeader title="Articles" className="py-6" />
      <div className="py-12 bg-slate-100">
        <Container>
          {articles.length === 0 && (
            <NoArticleFound keyparam={searchParams.k} />
          )}
          {articles.length !== 0 && searchParams && (
            <div className="mb-4">
              <div className="flex items-center gap-x-2">
                {searchParams.k && (
                  <h1 className="text-3xl font-bold">
                    Articles for {searchParams.k || ""}
                  </h1>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {articles.map((article, index) => (
              <div key={index} className="m-4">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default BlogPage;
