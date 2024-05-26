import React, { useEffect, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";

import { LiaChevronLeftSolid } from "react-icons/lia";
import { LiaChevronRightSolid } from "react-icons/lia";
import useWindowSize from "@/hooks/use-window-size";
import { Skeleton } from "../ui/skeleton";

interface CalendarHeaderProps {
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  onDayClick,
  onPrevDay,
  onNextDay,
}) => {
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();
  const isMobile = width !== undefined && width <= 767;
  const currentDate = selectedDate || new Date();
  const desktopStartOfWeek = startOfWeek(currentDate, {
    weekStartsOn: 1,
  });
  const mobileStartOfWeek = startOfWeek(currentDate, {
    weekStartsOn: currentDate.getDay() as 1 | 0 | 2 | 3 | 4 | 5 | 6,
  });
  const start = isMobile ? mobileStartOfWeek : desktopStartOfWeek;

  const numDaysToShow = isMobile ? 2 : 7;

  const days = Array.from({ length: numDaysToShow }, (_, index) =>
    addDays(start, index)
  );
  useEffect(() => {
    width ? setLoading(false) : setLoading(true);
  }, [width]);
  return (
    <>
      {loading ? (
        <Skeleton className="w-full h-16 rounded-full" />
      ) : (
        <div className="flex justify-between items-center mb-4 px-4 bg-gray-100 rounded-full">
          <button
            onClick={onPrevDay}
            className="p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400"
          >
            <LiaChevronLeftSolid className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex space-x-4">
            {days.map((day, index) => (
              <div
                key={index}
                onClick={() => onDayClick(day)}
                className={`cursor-pointer p-6 px-10 ${
                  format(day, "yyyy-MM-dd") ===
                  format(currentDate, "yyyy-MM-dd")
                    ? "bg-websecondary text-white shadow-md rounded-xl"
                    : " text-gray-900"
                }  hover:bg-websecondary-200`}
              >
                <div className="text-center font-bold">
                  {format(day, "EEE")}
                </div>
                <div className="text-center">{format(day, "dd MMM")}</div>
              </div>
            ))}
          </div>
          <button
            onClick={onNextDay}
            className="p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400"
          >
            <LiaChevronRightSolid className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      )}
    </>
  );
};

export default CalendarHeader;
