import { Purchase, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  phoneNumber?: string;
  registrationNumber?: string;
  qualification?: string;
  profession?: string;
  bio?: string;
  createdAt?: Date;
  updateAt?: Date;
  role: UserRole;
  purchases: Purchase[];
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
