export type Comment = {
  id: string;
  recipeId?: string | null;
  postId?: string | null;
  parentCommentId?: string | null;
  isPrimary: boolean;
  userId?: string | null;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  content: string;
  isPublished: boolean;
  createdAt: Date;
};
