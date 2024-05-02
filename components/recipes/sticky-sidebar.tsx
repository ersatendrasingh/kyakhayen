"use client";

import Image from "next/image";
import { MdOutlineRotateLeft } from "react-icons/md";
import { useEffect, useState } from "react";

//import VideoPlayIcon from "@/components/icons/video-play-icon";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
//import CourseFeatureItem from "@/components/courses/course-feature-item";
import AddToCart from "@/components/cart/add-to-cart";
import { CartItem } from "@/types/cart-item";
import { useUserCountry } from "@/context/user-country-context";
import { exchangePrice } from "@/lib/exchangePrice";
import Link from "next/link";
import { RecipeCategories, Recipes } from "@prisma/client";

type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
};

interface StickySidebarProps {
  recipe: RecipeWithCategory;
  cartItems: CartItem;
  className?: string;
}

const StickySidebar = ({ recipe, cartItems }: StickySidebarProps) => {
  return (
    <div className="sticky z-10 w-full top-20 mx-auto sm:px-2 px-4">
      <div className="bg-gray-100 p-4 right-0 border-2 border-[#1b88a7] rounded-md transition shadow-md overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Image
              src={recipe.imageUrl || "/placeholder.jpg"}
              alt={recipe.title || "Recipe Image"}
              width={950}
              height={600}
              className="rounded-md"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* <VideoPlayIcon
                videoUrl={recipe.chapters?.[0]?.videoUrl}
                isFree={course.chapters?.[0]?.isFree}
              /> */}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className=""></div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              <span className="text-webprimary text-lg font-semibold ml-3 color-ping">
                Few Seats Left
              </span>
            </h3>
          </div>
        </div>
        {/* {course.progress !== null ? (
          <Button className="bg-green-500 text-white hover:bg-green-600 text-md font-bold px-4 py-7 rounded-md mb-2 w-full">
            <Link href={`/courses/${course.slug}`}>Go to course</Link>
          </Button>
        ) : (
          <AddToCart item={cartItems} />
        )} */}

        <p className="flex items-center justify-center text-muted-foreground text-md text-center text-gray-600">
          <MdOutlineRotateLeft className="w-4 h-4 mr-1" />
          15 days money back guarantee
        </p>
        {/* <CourseFeatureItem title="Duration" value={course.duration || "N/A"} />
        <CourseFeatureItem
          title="Certificate"
          value={
            course.certificate ||
            "Yes, Unitus academy will reward a course completion certificate"
          }
        />
        <CourseFeatureItem
          title="Exams"
          value={
            course.exams ||
            "Exam to be conducted after the completion of the course"
          }
        />
        <CourseFeatureItem
          title="Experience Level"
          value={course.experienceLevel || "No prior experience required"}
        />
        <CourseFeatureItem
          title="Language"
          value={course.language || "English - Hindi"}
        /> */}
      </div>
    </div>
  );
};

export default StickySidebar;
