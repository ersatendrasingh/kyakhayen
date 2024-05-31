"use client";

import { User } from "@prisma/client";
import GenderInformation from "./gender-information";
import GeneralInformation from "./general-information";
import HeightAndWeight from "./height-and-weight";
import DateOfBirth from "./date-of-birth";

interface Gender {
  id: string;
  title: string;
  imageUrl: string | null;
  position: number | null;
}
interface UserProfileProps {
  userData:
    | (User & {
        gender: Gender | null;
      })
    | null;
  genders: Gender[];
}

const UserProfile = ({ userData, genders }: UserProfileProps) => {
  return (
    <div>
      <GeneralInformation />
      <GenderInformation userData={userData} genders={genders} />
      <DateOfBirth />
      <HeightAndWeight />
    </div>
  );
};

export default UserProfile;
