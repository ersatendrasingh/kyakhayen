import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";

import { Banner } from "@/components/banner";
import { ArticleActions } from "./_components/article-actions";

const ArticleIdPage = async ({ params }: { params: { articleId: string } }) => {
  const post = await db.post.findUnique({
    where: {
      id: params.articleId,
    },
    include: {
      PostCategory: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!post) {
    return redirect("/");
  }

  const categories = await db.category.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const categoriesData = post.PostCategory.map((category) => ({
    id: category.id,
    postId: category.postId,
    categoryId: category.categoryId,
    category: {
      id: category.category.id,
      title: category.category.title,
      slug: category.category.slug,
      imageUrl: category.category.imageUrl,
    },
  }));

  const requiredFields = [post.title, post.content, post.imageUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!post.isPublished && (
        <Banner
          variant="warning"
          label="This post is unpublished. It will not be visible to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Article Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <ArticleActions
            disabled={!isComplete}
            postId={params.articleId}
            isPublished={post.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Article</h2>
            </div>
            <TitleForm initialData={post} postId={post.id} />

            <ImageForm initialData={post} postId={post.id} />
            <CategoryForm
              initialData={categoriesData}
              postId={post.id}
              options={categories.map((category) => ({
                label: category.title,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Article Content</h2>
              </div>
              <DescriptionForm initialData={post} postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleIdPage;
