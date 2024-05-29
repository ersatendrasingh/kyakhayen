import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";

import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";
import { AllergiesList, CuisinesList, HealthGoalList } from "./types/user-type";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id as string);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser?.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.createdAt = token.createdAt as Date;
        session.user.updateAt = token.updateAt as Date;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.isPersonalised = token.isPersonalised as boolean;
        // session.user.age = token.age as number;
        // session.user.gender = token.gender as string;
        // session.user.prakriti = token.prakriti as string;
        // session.user.dob = token.dob as Date;
        // session.user.heightFt = token.heightFt as number;
        // session.user.heightInch = token.heightInch as number;
        // session.user.heightCm = token.heightCm as number;
        // session.user.weightKg = token.weightKg as number;
        // session.user.weightLbs = token.weightLbs as number;
        // session.user.bmi = token.bmi as string;
        // session.user.foodPreference = token.foodPreference as string;
        // session.user.cookingSkill = token.cookingSkill as string;
        // session.user.cuisines = token.cuisines as CuisinesList[];
        // session.user.allergies = token.allergies as AllergiesList[];
        // session.user.healthGoals = token.healthGoals as HealthGoalList[];
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.id = existingUser.id;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;
      token.phoneNumber = existingUser.phoneNumber;
      token.isPersonalised = existingUser.isPersonalised;
      // token.age = existingUser.age;
      // token.dob = existingUser.dob;
      // token.gender = existingUser.gender?.title;
      // token.prakriti = existingUser.userPrakriti?.title;
      // token.heightFt = existingUser.heightFt;
      // token.heightInch = existingUser.heightInch;
      // token.heightCm = existingUser.heightCm;
      // token.weightKg = existingUser.weightKg;
      // token.weightLbs = existingUser.weightLbs;
      // token.bmi = existingUser.bmi;
      // token.foodPreference = existingUser.foodPreference?.name;
      // token.cookingSkill = existingUser.cookingSkill?.title;
      // token.cuisines = existingUser.userCuisines;
      // token.allergies = existingUser.UserAllrgies;
      // token.healthGoals = existingUser.UserHealthGoals;
      token.createdAt = existingUser.createdAt;
      token.updateAt = existingUser.updateAt;

      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
