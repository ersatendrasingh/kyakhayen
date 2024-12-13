"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Mousewheel, Keyboard } from "swiper/modules";

import { cn } from "@/lib/utils";
import { HealthGoals as HealthGoalType } from "@prisma/client";

import { PersonalizationSkelton } from "@/components/user-personalization/personalization-skelton";
import useWindowSize from "@/hooks/use-window-size";

interface HealthGoalsProps {
  healthGoals: HealthGoalType[];
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}
const getSavedHealthGoals = (): string[] => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      return parsedUserData.healthGoals || [];
    }
    return [];
  } catch (error) {
    console.error("Error parsing saved health goals:", error);
    return [];
  }
};

const HealthGoals = ({
  healthGoals,
  title,
  setIsFormValid,
}: HealthGoalsProps) => {
  const [selectedHealthGoals, setSelectedHealthGoals] = useState<string[]>(() =>
    getSavedHealthGoals()
  );
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();
  useEffect(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    const updatedUserData = {
      ...existingUserData,
      healthGoals: selectedHealthGoals,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    setIsFormValid(selectedHealthGoals.length > 0);
  }, [selectedHealthGoals, setIsFormValid]);
  const toggleHealthGoalSelection = (healthGoalId: string) => {
    if (selectedHealthGoals.includes(healthGoalId)) {
      setSelectedHealthGoals(
        selectedHealthGoals.filter((id) => id !== healthGoalId)
      );
    } else {
      setSelectedHealthGoals([...selectedHealthGoals, healthGoalId]);
    }
  };
  const isHealthGoalSelected = (healthGoalId: string) =>
    selectedHealthGoals.includes(healthGoalId);
  if (loading) {
    return <PersonalizationSkelton />;
  }
  const isMobile = width !== undefined && width <= 767;
  return (
    <div>
      <h1 className="text-2xl  xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>

      <div
        className={cn(
          "w-full  md:max-w-screen-xl flex items-center justify-center",
          isMobile && "max-w-[360px]"
        )}
      >
        <Swiper
          className="w-full"
          cssMode={true}
          spaceBetween={isMobile ? 0 : 20}
          slidesPerView={isMobile ? 3 : 9}
          navigation={true}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Mousewheel, Keyboard]}
        >
          {healthGoals.map((healthGoal) => (
            <SwiperSlide
              key={healthGoal.id}
              onClick={() => toggleHealthGoalSelection(healthGoal.id)}
              className={cn(
                "rounded-full p-2 w-[112px] text-center hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative cursor-pointer"
              )}
            >
              <div className="relative overflow-hidden group">
                <Image
                  src={
                    healthGoal.imageUrl || "/assets/images/default-category.jpg"
                  }
                  alt={healthGoal.title || "Category Image"}
                  width={112}
                  height={112}
                  className="rounded-full"
                />
                <span
                  className={cn(
                    "absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300",
                    isHealthGoalSelected(healthGoal.id) &&
                      "bg-red-500 opacity-100 text-white"
                  )}
                ></span>
                <span className="absolute inset-0  flex items-center justify-center text-white  py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                  {healthGoal.title}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HealthGoals;
