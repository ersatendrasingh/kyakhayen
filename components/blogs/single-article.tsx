import { db } from "@/lib/db";

import Container from "@/components/container";

import { PageHeader } from "@/components/page-header";
import { getArticleBySlug } from "@/actions/get-article";
import ArticleBannerCard from "@/components/blogs/article-banner-card";
import ArticleDetails from "@/components/blogs/article-details";
import ArticleSidebar from "@/components/blogs/article-sidebar";
import ArticleComments from "@/components/blogs/article-comments";
import ArticleShareSection from "@/components/blogs/article-share-section";
const SingleArticle = async ({ articleSlug }: { articleSlug: string }) => {
  const article = await getArticleBySlug({
    blogSlug: articleSlug as string,
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const categories = await db.category.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: article.imageUrl,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: "KyaKhayen",
    },
  };

  return (
    <div className="w-full bg-slate-100 pb-8">
      <PageHeader title="Articles" className="py-6" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <Container>
        <div className="flex flex-col md:flex-row ">
          <div className="w-full lg:w-4/6 mr-0 lg:mr-8">
            <ArticleBannerCard
              article={article}
              className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
            />
            <ArticleDetails article={article} />
            <ArticleShareSection article={article} />
            <ArticleComments
              comments={article?.articleComments}
              articleId={article.id}
            />
          </div>
          <div className="w-full lg:w-2/6">
            <ArticleSidebar categories={categories} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SingleArticle;
