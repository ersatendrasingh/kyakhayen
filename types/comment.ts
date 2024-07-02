// types.ts
import { Comment } from "@prisma/client";

export interface CommentWithRelations extends Comment {
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    emailVerified: Date | null;
    image: string | null;
    password: string | null;
    bio: string | null;
    createdAt: Date;
    updateAt: Date;
  } | null;
  recipe?: {
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  Post?: {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
