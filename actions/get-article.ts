import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PostWithCategory } from "@/types/article";

export const getArticleBySlug = async ({
  blogSlug,
  blogMetaSlug,
}: {
  blogSlug: string;
  blogMetaSlug?: string | null;
}): Promise<PostWithCategory | null> => {
  try {
    if (blogSlug === undefined) {
      throw new Error("Article slug is required");
    }

    const user = await currentUser();
    const userId: string | undefined = user?.id;

    const post = await db.post.findFirst({
      where: {
        isPublished: true,
        AND: [
          { slug: blogSlug },
          ...(blogMetaSlug ? [{ metaSlug: blogMetaSlug }] : []),
        ],
      },
      include: {
        PostCategory: {
          include: {
            category: true,
          },
        },
        articleComments: {
          where: {
            OR: [{ isPublished: true }, { userId }],
          },
          include: {
            user: true,
            Post: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return post;
  } catch (error) {
    console.log("[GET_ARTICLE_BY_SLUG]", error);
    return null;
  }
};
