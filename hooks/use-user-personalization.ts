import axios from "axios";
import { useRouter } from "next/navigation";
interface UserData {
  cuisines?: string;
  allergies?: string; // allergies
  cookingSkill?: string; // health goals
  foodPreference?: string; // food preferences
  healthGoals?: string; // cooking skill
  gender?: string; // gender
  dob?: string;
  heightWeight?: string;
  prakritiSelections?: string;
}

export const parseDate = (dateString: string): string => {
  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return date.toISOString();
};
export const calculateAge = (dobString: string): number => {
  const [day, month, year] = dobString.split("/");
  const birthDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const collectPersonalizationData = () => {
  const userData = localStorage.getItem("userData");
  let parsedUserData: UserData = {};

  if (userData) {
    try {
      parsedUserData = JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  const rawDate = parsedUserData.dob || null;
  let formattedDate = null;
  let age = null;

  if (rawDate) {
    formattedDate = parseDate(rawDate);
    age = calculateAge(rawDate);
  }

  const data = {
    cuisines: parsedUserData.cuisines || {},
    allergies: parsedUserData.allergies || "",
    healthGoals: parsedUserData.healthGoals || "",
    foodPreferences: parsedUserData.foodPreference || "",
    cookingSkill: parsedUserData.cookingSkill || "",
    gender: parsedUserData.gender || "",
    dob: formattedDate,
    age: age,
    heightWeight: parsedUserData.heightWeight || "",
    prakritiSelections: parsedUserData.prakritiSelections || "",
  };

  return data;
};
