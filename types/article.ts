import { Category, Post, PostCategory } from "@prisma/client";

export type PostWithCategory = Post & {
  PostCategory: (PostCategory & {
    category: Category;
  })[];
};
