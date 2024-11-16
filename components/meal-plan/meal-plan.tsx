"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, subDays } from "date-fns";
import CalendarHeader from "@/components/calendar/calendar-header";
import DailyView from "@/components/meal-plan/daily-view";

import PersonalizationPrompt from "@/components/meal-plan/personalization-prompt";
import SubscriptionPlanPrompt from "@/components/meal-plan/subscription-plan-prompt";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import PublicView from "./public-view";

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
    setSelectedDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  };

  if (!user) {
    return <PublicView />;
  }

  if (user && !user.isPersonalised) {
    return <PersonalizationPrompt />;
  }
  if (user && user.userPlan?.length === 0) {
    return <SubscriptionPlanPrompt />;
  }
  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <CalendarHeader
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />
        {selectedDate && <DailyView date={selectedDate} />}
      </div>
    </main>
  );
};

export default MealPlan;
