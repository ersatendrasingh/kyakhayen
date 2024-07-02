import { Category, Post, PostCategory } from "@prisma/client";
import { CommentWithRelations } from "./comment";

export type PostWithCategory = Post & {
  PostCategory: (PostCategory & {
    category: Category;
  })[];
  articleComments: CommentWithRelations[];
};
