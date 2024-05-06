import { User, UserRole } from "@prisma/client";
interface UserDataWithPurchase extends User {}
export type userType = UserDataWithPurchase;
