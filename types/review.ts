import { Review } from "@prisma/client";

export interface ReviewWithRelations extends Review {
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
}
