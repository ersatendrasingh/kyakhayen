"use client";

import { useState } from "react";
import DailyView from "@/components/meal-plan/daily-view";

import { PageHeader } from "@/components/page-header";
import CalendarHeader from "@/components/calendar/calendar-header";

import { addDays, subDays } from "date-fns";

const MealPlanPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  };

  return (
    <div>
      <PageHeader title="Meal Plan" className="py-12" />
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
    </div>
  );
};

export default MealPlanPage;
