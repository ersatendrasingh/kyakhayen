"use client";

import { cn } from "@/lib/utils";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Mousewheel, Keyboard } from "swiper/modules";

import { Skeleton } from "@/components/ui/skeleton";

import { RecipeCategories as FoodPreferencesType } from "@prisma/client";

interface FoodPreferencesProps {
  foodPreferences: FoodPreferencesType[];
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}

const getSavedFoodPreference = (): string | null => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      return parsedUserData.foodPreference || null;
    }
    return null;
  } catch (error) {
    console.error("Error parsing saved food preference:", error);
    return null;
  }
};
const FoodPreferences = ({
  foodPreferences,
  title,
  setIsFormValid,
}: FoodPreferencesProps) => {
  const [selectedFoodPreference, setSelectedFoodPreference] = useState<
    string | null
  >(() => getSavedFoodPreference());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedFoodPreference = getSavedFoodPreference();
    setSelectedFoodPreference(savedFoodPreference);
    setLoading(false);
  }, []);

  useEffect(() => {
    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    const updatedUserData = {
      ...existingUserData,
      foodPreference: selectedFoodPreference,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    setIsFormValid(!!selectedFoodPreference); // Update validation status
  }, [selectedFoodPreference, setIsFormValid]);

  const toggleFoodPreferenceSelection = (foodPreferenceId: string) => {
    if (selectedFoodPreference === foodPreferenceId) {
      setSelectedFoodPreference(null);
    } else {
      setSelectedFoodPreference(foodPreferenceId);
    }
  };

  const isFoodPreferenceSelected = (foodPreferenceId: string) =>
    selectedFoodPreference === foodPreferenceId;

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
      <h1 className="text-2xl xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>
      <div className="mt-10 px-5">
        <div className="w-full max-w-screen-xl mx-auto">
          <Swiper
            className="w-full"
            cssMode={true}
            spaceBetween={20}
            slidesPerView={5}
            navigation={true}
            mousewheel={true}
            keyboard={true}
            modules={[Navigation, Mousewheel, Keyboard]}
          >
            {foodPreferences.map((foodPreference) => (
              <SwiperSlide
                key={foodPreference.id}
                onClick={() => toggleFoodPreferenceSelection(foodPreference.id)}
                className={cn(
                  "rounded-full p-2 text-center min-w-[150px] hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative cursor-pointer"
                )}
              >
                <div className="relative overflow-hidden group">
                  <Image
                    src={
                      foodPreference.imageUrl ||
                      "/assets/images/default-category.jpg"
                    }
                    alt={foodPreference.name || "Category Image"}
                    width={180}
                    height={180}
                    className="rounded-full"
                  />
                  <span
                    className={cn(
                      "absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300",
                      isFoodPreferenceSelected(foodPreference.id) &&
                        "bg-red-500 opacity-100 text-white"
                    )}
                  ></span>
                  <span className="absolute inset-0 flex items-center justify-center text-white py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                    {foodPreference.name}
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

export default FoodPreferences;
