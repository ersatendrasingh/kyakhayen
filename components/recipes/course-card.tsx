"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/formatCurrency";
import { useUserCountry } from "@/context/user-country-context";
import { exchangePrice } from "@/lib/exchangePrice";
import { Categories, Courses } from "@prisma/client";
import { CourseProgress } from "../course-progress";

type CourseWithProgressWithCategory = Courses & {
  category: Categories | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CourseCardProps {
  course: CourseWithProgressWithCategory;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    setIsInView(inView);
  }, [inView]);

  const [itemPrice, setItemPrice] = useState(course.price);
  const { userCurrency, userCountry } = useUserCountry();
  useEffect(() => {
    const handlePriceExchange = async (price: number, userCurrency: string) => {
      try {
        const exchangedValue = await exchangePrice(price, userCurrency);
        setItemPrice(exchangedValue);
      } catch (error) {
        console.error("Error exchanging price:", error);
        setItemPrice(price);
      }
    };
    if (!userCountry) return;
    userCountry !== "IN"
      ? handlePriceExchange(course.int_price as number, userCurrency)
      : handlePriceExchange(course.price as number, userCurrency);
  }, [userCurrency, userCountry, course.price, course.int_price]);

  return (
    <div
      ref={ref}
      className={`max-w-sm rounded overflow-hidden shadow-lg transform transition-transform hover:shadow-xl hover:-translate-y-1 ${
        isInView ? "animate-slide-up" : ""
      }`}
    >
      <Link href={`/course/${course.slug}`}>
        <div className="h-full flex flex-col">
          <Image
            className="w-full"
            src={course.imageUrl || "https://via.placeholder.com/300x200"}
            alt={course.title || "Course Image"}
            width={300}
            height={200}
          />
          <div className="px-6 py-4 min-h-24">
            <div className="font-bold text-xl mb-2">{course.title}</div>
          </div>
          {course.progress !== null ? (
            <div className="px-6 pt-4 pb-2">
              <div className="font-semibold text-xl text-emerald-800">
                <CourseProgress
                  variant={course.progress === 100 ? "success" : "default"}
                  size="sm"
                  value={course.progress}
                />
              </div>
            </div>
          ) : (
            <div className="px-6 pt-4 pb-2">
              <div className="font-semibold text-xl text-emerald-800">
                {formatCurrency(itemPrice as number, userCurrency)}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
