import { Cuisines, User, UserCuisines, UserRole } from "@prisma/client";
interface UserDataWithPersonalised extends User {
  userCuisines: UserCuisines &
    {
      cuisine: Cuisines;
    }[];
}
export type userType = UserDataWithPersonalised;

export type CusineItem = {
  id: string;
  title: string;
};
