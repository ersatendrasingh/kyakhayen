"use client";

import { cn } from "@/lib/utils";
import { Gender as GenderType } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Mousewheel, Keyboard } from "swiper/modules";
import { Skeleton } from "@/components/ui/skeleton";
import useWindowSize from "@/hooks/use-window-size";

interface GenderProps {
  genders: GenderType[];
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}

const getSavedGender = (): string | null => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      return parsedUserData.gender || null;
    }
    return null;
  } catch (error) {
    console.error("Error parsing saved gender:", error);
    return null;
  }
};
const Gender = ({ genders, title, setIsFormValid }: GenderProps) => {
  const [selectedGender, setSelectedGender] = useState<string | null>(() =>
    getSavedGender()
  );
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();
  useEffect(() => {
    const savedGender = getSavedGender();
    setSelectedGender(savedGender);
    setLoading(false);
  }, []);

  useEffect(() => {
    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    const updatedUserData = {
      ...existingUserData,
      gender: selectedGender,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    setIsFormValid(!!selectedGender);
  }, [selectedGender, setIsFormValid]);

  const toggleGenderSelection = (genderId: string) => {
    if (selectedGender === genderId) {
      setSelectedGender(null);
    } else {
      setSelectedGender(genderId);
    }
  };

  const isGenderSelected = (genderId: string) => selectedGender === genderId;
  const isMobile = width !== undefined && width <= 767;
  if (loading) {
    return (
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full mx-3 hidden md:flex" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>

      <div
        className={cn(
          "w-full md:w-[320px]  flex items-center justify-center",
          isMobile && "max-w-[320px]"
        )}
      >
        <Swiper
          className="w-full"
          cssMode={true}
          spaceBetween={20}
          slidesPerView={2}
          navigation={true}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Mousewheel, Keyboard]}
        >
          {genders.map((gender) => (
            <SwiperSlide
              key={gender.id}
              onClick={() => toggleGenderSelection(gender.id)}
              className={cn(
                "rounded-full bg-slate-200 p-5 text-center w-[120px] md:w-[150px] hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative cursor-pointer",
                isGenderSelected(gender.id) &&
                  "bg-red-500 opacity-100 text-white"
              )}
            >
              <div className="relative overflow-hidden group">
                <Image
                  src={gender.imageUrl || "/assets/images/default-category.jpg"}
                  alt={gender.title || "Gender Image"}
                  width={150}
                  height={150}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Gender;
