import { RecipeWithCategory } from "@/types/recipe";
import MealPlanCard from "@/components/meal-plan/meal-plan-card"; // Adjust the import path as necessary
import { MealTimes } from "@prisma/client";
import { useEffect, useState } from "react";
import { getMealPlan } from "@/actions/get-meal-plan";
import { FaPlus, FaMinus } from "react-icons/fa";
import Image from "next/image";

interface DailyViewProps {
  date: Date;
}

const DailyView = ({ date }: DailyViewProps) => {
  const [mealsByTime, setMealsByTime] = useState<{
    [key: string]: RecipeWithCategory[];
  }>({});
  const [mealTimes, setMealTimes] = useState<MealTimes[]>([]);
  const [expandedMealTime, setExpandedMealTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    if (date) {
      fetchMealPlan(date);
    }
  }, [date]);

  const fetchMealPlan = async (date: Date) => {
    setLoading(true);
    const mealPlanResult = await getMealPlan({ date });
    if (mealPlanResult) {
      const { mealTimes, mealsByTime } = mealPlanResult;
      setMealsByTime(mealsByTime);
      setMealTimes(mealTimes);
      // By default, expand the first meal time
      if (mealTimes.length > 0) {
        setExpandedMealTime(mealTimes[0].slug);
      }
    } else {
      console.error("Meal plan not available for the selected date.");
    }
    setLoading(false);
  };

  const handleMealTimeClick = (mealTimeSlug: string) => {
    setExpandedMealTime((prevMealTime) =>
      prevMealTime === mealTimeSlug ? null : mealTimeSlug
    );
  };
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center h-64">
        <h2 className="text-md font-semibold mb-4">
          Meals for {date.toDateString()}
        </h2>
        <Image src="/assets/cook.gif" alt="Loading" width={200} height={200} />
      </div>
    );
  }
  return (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-md font-semibold text-center mb-4">
        Meals for {date.toDateString()}
      </h2>
      {mealTimes.map((mealTime) => (
        <div key={mealTime.id} className="mb-4">
          <button
            className="bg-webprimary p-2 pl-5 rounded-full w-full text-white text-sm font-medium mb-2 flex justify-between items-center transition-transform duration-300"
            onClick={() => handleMealTimeClick(mealTime.slug)}
          >
            {mealTime.title}
            {expandedMealTime === mealTime.slug ? <FaMinus /> : <FaPlus />}
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              expandedMealTime === mealTime.slug ? "max-h-screen" : "max-h-0"
            }`}
          >
            {expandedMealTime === mealTime.slug &&
              mealsByTime[mealTime.slug]?.map((recipe) => (
                <div key={recipe.id} className="my-2">
                  <MealPlanCard recipe={recipe} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyView;
