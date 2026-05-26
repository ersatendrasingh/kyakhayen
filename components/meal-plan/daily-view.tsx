import { RecipeWithCategory } from "@/types/recipe";
import MealPlanCard from "@/components/meal-plan/meal-plan-card";
import { MealTimes } from "@prisma/client";
import { useEffect, useState } from "react";

import { getMealPlanFromS3 } from "@/actions/get-meal-plan-from-s3";
import { formatDate } from "@/lib/formatDate";
import { format, formatISO } from "date-fns";
import { getUserLatestPlanDates } from "@/actions/get-user-meal-plan-dates";
import {
  ArrowRight,
  CalendarRange,
  Loader,
  RefreshCcw,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DailyViewProps {
  date: Date;
  onSelectDate: (date: Date) => void;
}

const DailyView = ({ date, onSelectDate }: DailyViewProps) => {
  const [mealsByTime, setMealsByTime] = useState<{
    [key: string]: RecipeWithCategory[];
  }>({});
  const [mealTimes, setMealTimes] = useState<MealTimes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [planStartWarning, setPlanStartWarning] = useState<boolean>(false);
  const [planEndWarning, setPlanEndWarning] = useState<boolean>(false);
  const [mealPlanStartDate, setMealPlanStartDate] = useState<Date>(new Date());
  const [mealPlanEndDate, setMealPlanEndDate] = useState<Date>(new Date());
  const [planUnavailable, setPlanUnavailable] = useState(false);
  const [planLoadError, setPlanLoadError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

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
      setPlanUnavailable(false);
      setPlanLoadError(false);

      try {
        const formattedDate = formatISO(date, { representation: "date" });

        const mealPlanResult = await getMealPlanFromS3({ date: formattedDate });

        if (mealPlanResult && mealPlanResult.mealTimes.length > 0) {
          const { mealTimes, mealsByTime } = mealPlanResult;
          setMealsByTime(mealsByTime || {});
          setMealTimes(mealTimes);
        } else {
          setPlanUnavailable(true);
        }
      } catch (error) {
        console.error("Error fetching or generating meal plan:", error);
        setPlanLoadError(true);
      }

      setLoading(false);
    };

    if (date) {
      fetchMealPlan();
    }
  }, [date, refreshCount]);

  const areAllMealsEmpty = () => {
    return Object.values(mealsByTime).every(
      (mealArray) => mealArray.length === 0
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[1.5rem] border border-[#eadcc8] bg-white p-4 shadow-sm">
        <Loader className="size-6 animate-spin" />
        <h2 className="mt-4 text-sm font-medium text-[#695b4e]">
          Loading your meals for {format(date, "EEEE")}
        </h2>
      </div>
    );
  }

  if (planStartWarning) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#eadcc8] bg-white shadow-sm">
        <div className="border-b border-[#f0e5d6] bg-[#fff8ef] px-5 py-4 sm:px-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a6b42]">
            Outside your weekly plan
          </p>
        </div>
        <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2ec] text-primary">
              <CalendarRange className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#2c2118]">
                Your plan begins on {formatDate(mealPlanStartDate)}
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-[#695b4e]">
                Open your first planned day to see the meals made for your
                choices.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="w-full rounded-full px-5 sm:w-auto"
            onClick={() => onSelectDate(mealPlanStartDate)}
          >
            Go to first day <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (planEndWarning) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#eadcc8] bg-white shadow-sm">
        <div className="border-b border-[#f0e5d6] bg-[#fff8ef] px-5 py-4 sm:px-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a6b42]">
            Outside your weekly plan
          </p>
        </div>
        <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2ec] text-primary">
              <CalendarRange className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#2c2118]">
                This plan ends on {formatDate(mealPlanEndDate)}
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-[#695b4e]">
                Return to the final planned day, or create fresh choices for
                your next week.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="rounded-full px-5"
              onClick={() => onSelectDate(mealPlanEndDate)}
            >
              Last planned day <ArrowRight className="size-4" />
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/meal-plan/create">New week</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (planUnavailable) {
    return (
      <div className="rounded-[1.5rem] border border-[#eadcc8] bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff2ec] text-primary">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">Your plan is being prepared</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          A newly created or refreshed plan can take a short moment to appear.
          Refresh here, or adjust your food choices whenever you need to.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            className="rounded-full px-6"
            onClick={() => setRefreshCount((count) => count + 1)}
          >
            <RefreshCcw className="size-4" /> Check again
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/meal-plan/create">Edit preferences</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (planLoadError) {
    return (
      <div className="rounded-[1.5rem] border border-[#eadcc8] bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff2ec] text-primary">
          <RefreshCcw className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">
          We could not open your saved plan
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Your plan may already be saved, but storage could not be accessed
          right now. Please retry in a moment.
        </p>
        <Button
          type="button"
          className="mt-7 rounded-full px-6"
          onClick={() => setRefreshCount((count) => count + 1)}
        >
          <RefreshCcw className="size-4" /> Retry opening plan
        </Button>
      </div>
    );
  }

  if (areAllMealsEmpty()) {
    return (
      <div className="rounded-2xl border border-[#eadcc8] bg-white px-5 py-7 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff2ec] text-primary">
            <UtensilsCrossed className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[#2c2118]">
            No meals were saved for this day
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#695b4e]">
            Generate your plan again to fill every time slot with your latest
            food choices.
          </p>
          <Button asChild className="mt-5 rounded-full px-6">
            <Link href="/meal-plan/create">Update and generate</Link>
          </Button>
        </div>
      </div>
    );
  }

  const mealCount = Object.values(mealsByTime).reduce(
    (count, recipes) => count + recipes.length,
    0,
  );

  return (
    <section className="-mx-4 border-y border-[#eadcc8] bg-[#fffaf2] p-4 sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:p-5 sm:shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#f0e5d6] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {format(date, "EEEE")}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#2c2118]">
            {format(date, "d MMM yyyy")}
          </h2>
        </div>
        <p className="rounded-full bg-[#fff2ec] px-3 py-1.5 text-xs font-medium text-[#78461f]">
          {mealCount} {mealCount === 1 ? "dish" : "dishes"}
        </p>
      </div>
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {mealTimes.map((mealTime) => {
          const recipes = mealsByTime[mealTime.slug] || [];
          return (
            <div
              key={mealTime.id}
              className="rounded-2xl border border-[#f0e5d6] bg-white p-3 shadow-sm sm:rounded-xl sm:bg-[#fffdf9] sm:p-4 sm:shadow-none"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <h3 className="text-sm font-semibold text-[#2c2118]">
                  {mealTime.title}
                </h3>
                <span className="h-px flex-1 bg-[#f0e5d6]" />
                <span className="text-[11px] font-medium text-[#8b7a69]">
                  {recipes.length || "-"}
                </span>
              </div>
              <div className="space-y-2">
                {recipes.length > 0 ? recipes.map((recipe) => (
                  <MealPlanCard
                    key={recipe.id}
                    recipe={recipe}
                  />
                )) : (
                  <p className="rounded-lg border border-dashed border-[#eadcc8] px-3 py-4 text-xs text-[#8b7a69]">
                    Regenerate your plan to fill this slot.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DailyView;
