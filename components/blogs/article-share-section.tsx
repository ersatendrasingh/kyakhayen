"use client";

import SocialShare from "@/components/social-share";
import { PostWithCategory } from "@/types/article";

interface ArticleShareSectionProps {
  article: PostWithCategory;
}

const ArticleShareSection = ({ article }: ArticleShareSectionProps) => {
  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${article.slug}`;
  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Share this article</h1>
      <SocialShare
        url={articleUrl}
        title={article.title}
        description={article.content!}
        imageUrl={article.imageUrl!}
      />
    </div>
  );
};

export default ArticleShareSection;
