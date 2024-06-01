"use client";

import { PrakritiQuestion, PrakritiQuestionOption, User } from "@prisma/client";
import GenderInformation from "./gender-information";
import GeneralInformation from "./general-information";
import HeightAndWeight from "./height-and-weight";
import DateOfBirth from "./date-of-birth";
import PrakritiInformation from "./prakriti-information";
interface PrakritiQuestionType extends PrakritiQuestion {
  options: PrakritiQuestionOption[];
}
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
  prakritiQuestions: PrakritiQuestionType[];
}

const UserProfile = ({
  userData,
  genders,
  prakritiQuestions,
}: UserProfileProps) => {
  return (
    <div>
      <GeneralInformation />
      <GenderInformation userData={userData} genders={genders} />
      <DateOfBirth />
      <HeightAndWeight />
      <PrakritiInformation prakritiQuestions={prakritiQuestions} />
    </div>
  );
};

export default UserProfile;
