import { RecipeWithCategory } from "@/types/recipe";
import MealPlanCard from "@/components/meal-plan/meal-plan-card"; // Adjust the import path as necessary
import { MealTimes } from "@prisma/client";
import { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import Image from "next/image";

import { getMealPlanFromS3 } from "@/actions/get-meal-plan-from-s3";
import { formatDate } from "@/lib/formatDate";
import { formatISO } from "date-fns";
import { toast } from "react-toastify";
import { getUserLatestPlanDates } from "@/actions/get-user-meal-plan-dates";

interface DailyViewProps {
  date: Date;
}

const DailyView = ({ date }: DailyViewProps) => {
  const [mealsByTime, setMealsByTime] = useState<{
    [key: string]: RecipeWithCategory[];
  }>({});
  const [mealTimes, setMealTimes] = useState<MealTimes[]>([]);
  const [expandedMealTime, setExpandedMealTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [planStartWarning, setPlanStartWarning] = useState<boolean>(false);
  const [planEndWarning, setPlanEndWarning] = useState<boolean>(false);
  const [mealPlanStartDate, setMealPlanStartDate] = useState<Date>(new Date());
  const [mealPlanEndDate, setMealPlanEndDate] = useState<Date>(new Date());
  // Function to normalize date (set time to midnight)
  const normalizeDate = (date: Date): Date => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  };
  useEffect(() => {
    setPlanStartWarning(false);
    setPlanEndWarning(false);

    const fetchUserPlanDates = async () => {
      try {
        const { startDate, endDate } = await getUserLatestPlanDates();

        const userPlanStartDate = normalizeDate(new Date(startDate));
        const userPlanEndDate = normalizeDate(new Date(endDate));

        const selectedDate = normalizeDate(new Date(date));
        setMealPlanStartDate(userPlanStartDate);
        setMealPlanEndDate(userPlanEndDate);

        if (selectedDate < userPlanStartDate) {
          setPlanStartWarning(true);
        }

        if (selectedDate > userPlanEndDate) {
          setPlanEndWarning(true);
        }
      } catch (error) {
        console.error("Error fetching user's meal plan dates:", error);
      }
    };

    fetchUserPlanDates();
  }, [date]);

  useEffect(() => {
    const fetchMealPlan = async () => {
      setLoading(true);

      try {
        // Fetch meal plan for the specified date
        const formattedDate = formatISO(date, { representation: "date" });

        const mealPlanResult = await getMealPlanFromS3({ date: formattedDate });

        if (mealPlanResult) {
          const { mealTimes, mealsByTime } = mealPlanResult;
          setMealsByTime(mealsByTime);
          setMealTimes(mealTimes);

          // Expand the first meal time by default
          if (mealTimes.length > 0) {
            setExpandedMealTime(mealTimes[0].slug);
          }
        } else {
          toast.error("Meal plan not available for the selected date.", {
            position: "top-center",
            autoClose: 5000,
          });

          console.log("Meal plan not available for the selected date.");
        }
      } catch (error) {
        console.error("Error fetching or generating meal plan:", error);
      }

      setLoading(false);
    };

    if (date) {
      fetchMealPlan();
    }
  }, [date]);

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

  if (planStartWarning) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
        <Image
          src="/assets/images/no.png"
          alt="Loading"
          width={200}
          height={200}
          className="my-5"
        />
        <h2 className="text-lg font-semibold mb-10 text-center">
          Your meal plan starts from {formatDate(mealPlanStartDate)}. Please
          select a date on or after this date.
        </h2>
      </div>
    );
  }

  if (planEndWarning) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
        <Image
          src="/assets/images/no.png"
          alt="Loading"
          width={200}
          height={200}
          className="my-5"
        />
        <h2 className="text-lg font-semibold mb-10 text-center">
          Your meal plan is ended on {formatDate(mealPlanEndDate)}. Please
          select a date on or before this date.
        </h2>
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
