import { Purchase, User, UserRole } from "@prisma/client";
interface UserDataWithPurchase extends User {
  purchase: Purchase[];
}
export type userType = UserDataWithPurchase;
