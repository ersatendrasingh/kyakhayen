"use client";

import { Badge } from "@/components/ui/badge";
import { AllergiesList, CuisinesList, HealthGoalList } from "@/types/user-type";

interface ProfileItemsProps {
  label: string;
  cuisines?: CuisinesList[];
  allergies?: AllergiesList[];
  healthGoals?: HealthGoalList[];
}

const ProfileItems = ({
  label,
  cuisines,
  allergies,
  healthGoals,
}: ProfileItemsProps) => {
  return (
    <div className="flex w-full items-center justify-between py-2">
      <div className="w-1/3 font-semibold">{label}</div>
      <div className="w-2/3">
        {cuisines &&
          cuisines.length > 0 &&
          cuisines.map((value) => (
            <Badge key={value.id} className="bg-websecondary text-white">
              {value.cuisine.title}
            </Badge>
          ))}
        {allergies &&
          allergies.length > 0 &&
          allergies.map((value) => (
            <Badge key={value.id} className="bg-websecondary text-white">
              {value.allergy.title}
            </Badge>
          ))}
        {healthGoals &&
          healthGoals.length > 0 &&
          healthGoals.map((value) => (
            <Badge key={value.id} className="bg-websecondary text-white">
              {value.healthGoal.title}
            </Badge>
          ))}
      </div>
    </div>
  );
};

export default ProfileItems;
