"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, subDays } from "date-fns";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import CalendarHeader from "@/components/calendar/calendar-header";
import DailyView from "@/components/meal-plan/daily-view";

import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import MealPlanLanding from "./meal-plan-landing";

const MealPlan = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const hasRunOnce = useRef(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!hasRunOnce.current) {
      update();
      hasRunOnce.current = true;
    }
  }, [update]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 7));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 7));
  };

  if (!user || !user.isPersonalised) {
    return <MealPlanLanding isSignedIn={Boolean(user)} />;
  }
  return (
    <main className="min-h-screen bg-[#fffaf2] pb-24 pt-4 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-end">
          <div>
            <p className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary sm:flex">
              <Sparkles className="size-4" /> Made for your table
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-[#2c2118] sm:mt-2 sm:text-3xl">
              Your personalized meal plan
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[#695b4e] sm:mt-2 sm:text-sm">
              <span className="sm:hidden">Your seven-day food planner</span>
              <span className="hidden sm:inline">
                Seven days of meal ideas based on your food style, cuisines,
                exclusions and cooking comfort.
              </span>
            </p>
          </div>
          <Link
            href="/meal-plan/create"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d9c7b0] bg-white px-3 py-2 text-xs font-semibold text-[#4c3c2f] transition hover:border-primary hover:text-primary sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Edit</span>
            <span className="hidden sm:inline">Edit my choices</span>
            <ArrowRight className="size-3.5 sm:size-4" />
          </Link>
        </header>
        <CalendarHeader
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />
        <div className="mt-3">
          {selectedDate && (
            <DailyView date={selectedDate} onSelectDate={handleDayClick} />
          )}
        </div>
      </div>
    </main>
  );
};

export default MealPlan;
