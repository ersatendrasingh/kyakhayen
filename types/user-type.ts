import { User, UserRole } from "@prisma/client";
interface UserDataWithPurchase extends User {}
export type userType = UserDataWithPurchase;

export type CusineItem = {
  id: string;
  title: string;
};
