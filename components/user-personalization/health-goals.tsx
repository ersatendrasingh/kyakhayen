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

import { Skeleton } from "@/components/ui/skeleton";

interface HealthGoalsProps {
  healthGoals: HealthGoalType[];
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}
const getSavedHealthGoals = (): string[] => {
  try {
    const savedHealthGoals = localStorage.getItem("SHG");
    return savedHealthGoals ? JSON.parse(savedHealthGoals) : [];
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

  useEffect(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    localStorage.setItem("SHG", JSON.stringify(selectedHealthGoals));
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
    return (
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl  xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>
      <div className="mt-10 px-5">
        <div className="w-full max-w-screen-xl mx-auto">
          <Swiper
            className="w-full"
            cssMode={true}
            spaceBetween={20}
            slidesPerView={7}
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
                  "rounded-full p-2 min-w-[150px] text-center hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative cursor-pointer"
                )}
              >
                <div className="relative overflow-hidden group">
                  <Image
                    src={
                      healthGoal.imageUrl ||
                      "/assets/images/default-category.jpg"
                    }
                    alt={healthGoal.title || "Category Image"}
                    width={180}
                    height={180}
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
    </div>
  );
};

export default HealthGoals;
