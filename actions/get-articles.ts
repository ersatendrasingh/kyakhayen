"use server";

import { db } from "@/lib/db";

import { PostWithCategory } from "@/types/article";

type GetArticles = {
  title?: string;
  searchSlug?: string;
  searchType?: string;
};

export const getArticles = async ({
  title,
  searchSlug,
  searchType,
}: GetArticles): Promise<PostWithCategory[]> => {
  try {
    let articles;
    if (searchType && searchType === "category") {
      const postCategory = await db.category.findFirst({
        where: {
          slug: searchSlug,
        },
      });

      articles = await db.post.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
          PostCategory: {
            some: { categoryId: postCategory?.id },
          },
        },
        include: {
          PostCategory: {
            include: {
              category: true,
            },
          },
          articleComments: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      articles = await db.post.findMany({
        where: {
          isPublished: true,
          title: {
            contains: title,
          },
        },
        include: {
          PostCategory: {
            include: {
              category: true,
            },
          },
          articleComments: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return articles;
  } catch (error) {
    console.error("[GET_ARTICLES]", error);
    return [];
  }
};
