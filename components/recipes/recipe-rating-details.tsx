"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import badgeIcon from "@/public/assets/images/badge-icon.webp";
import RatingStars from "@/components/recipes/rating-star";

interface RecipeRatingDetailsProps {
  rating: number;
  reviews: number;
  totalViewsCount: number;
}

const RecipeRatingDetails = ({
  rating,
  reviews,
  totalViewsCount,
}: RecipeRatingDetailsProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Set breakpoint as per your design
    };

    handleResize(); // Call handleResize initially to set isMobile state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center md:my-2">
      <div className="text-sm text-gray-700 flex items-center">
        <p className="mr-1 text-lg">{rating}</p>
        <RatingStars rating={rating} />
      </div>
      <div className="text-sm text-gray-700 flex items-center md:flex-grow">
        <p className="ml-2 md:text-md bg-gray-200/20 hover:bg-gray-200/60 transition duration-300 cursor-pointer p-2 rounded-md md:ml-4">
          {reviews.toLocaleString()} ratings
        </p>
        <p className="ml-2 text-sm text-black md:ml-4">
          {totalViewsCount.toLocaleString()} Unique Views
        </p>
      </div>
    </div>
  );
};

export default RecipeRatingDetails;
