import { Purchase, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import { AllergiesList, CuisinesList, HealthGoalList } from "./types/user-type";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  phoneNumber?: string;
  bio?: string;
  age?: number;
  gender?: string;
  prakriti?: string;
  dob?: Date;
  heightFt?: number;
  heightInch?: number;
  heightCm?: number;
  weightKg?: number;
  weightLbs?: number;
  bmi?: string;
  userPlan?: string[];
  userPlanStartDate: Date[];
  userPlanEndDate: Date[];
  foodPreference?: string;
  cookingSkill?: string;
  firebaseToken?: string;
  createdAt?: Date;
  updateAt?: Date;
  role: UserRole;
  cuisines: CuisinesList[];
  healthGoals: HealthGoalList[];
  allergies: AllergiesList[];
  isTwoFactorEnabled: boolean;
  isPersonalised: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
