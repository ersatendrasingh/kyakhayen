"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Mousewheel, Keyboard } from "swiper/modules";

import { cn } from "@/lib/utils";
import { Allergies as AllergyType } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import useWindowSize from "@/hooks/use-window-size";

interface AllergiesProps {
  allergies: AllergyType[];
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}
const getSavedAllergies = (): string[] => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      return parsedUserData.allergies || [];
    }
    return [];
  } catch (error) {
    console.error("Error parsing saved allergies:", error);
    return [];
  }
};

const Allergies = ({ allergies, title, setIsFormValid }: AllergiesProps) => {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(() =>
    getSavedAllergies()
  );
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();

  useEffect(() => {
    setLoading(false); // Set loading state to false after loading
  }, []);
  useEffect(() => {
    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    const updatedUserData = {
      ...existingUserData,
      allergies: selectedAllergies,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    setIsFormValid(selectedAllergies.length > 0); // Update validation status
  }, [selectedAllergies, setIsFormValid]);

  const toggleAllergySelection = (allergyId: string) => {
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter((id) => id !== allergyId));
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId]);
    }
  };
  const isAllergySelected = (allergyId: string) =>
    selectedAllergies.includes(allergyId);
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
          slidesPerView={isMobile ? 3 : 7}
          navigation={true}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Mousewheel, Keyboard]}
        >
          {allergies.map((allergy) => (
            <SwiperSlide
              key={allergy.id}
              onClick={() => toggleAllergySelection(allergy.id)}
              className={cn(
                "rounded-full p-2 w-[120px] md:w-[150px] text-center hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative cursor-pointer"
              )}
            >
              <div className="relative overflow-hidden group">
                <Image
                  src={
                    allergy.imageUrl || "/assets/images/default-category.jpg"
                  }
                  alt={allergy.title || "Category Image"}
                  width={180}
                  height={180}
                  className="rounded-full"
                />
                <span
                  className={cn(
                    "absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300",
                    isAllergySelected(allergy.id) &&
                      "bg-red-500 opacity-100 text-white"
                  )}
                ></span>
                <span className="absolute inset-0  flex items-center justify-center text-white  py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                  {allergy.title}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Allergies;
