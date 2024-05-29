import { Cuisines, User, UserRole } from "@prisma/client";
interface UserDataWithPurchase extends User {}
export type userType = UserDataWithPurchase;

export type CusineItem = {
  id: string;
  title: string;
};
type Cuisine = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

export type CuisinesList = {
  id: string;
  userId: string;
  cuisineId: string;
  cuisine: Cuisine;
};

type Allergy = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

export type AllergiesList = {
  id: string;
  userId: string;
  allergyId: string;
  allergy: Cuisine;
};

type HealthGoal = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
};

export type HealthGoalList = {
  id: string;
  userId: string;
  healthGoalId: string;
  healthGoal: Cuisine;
};
