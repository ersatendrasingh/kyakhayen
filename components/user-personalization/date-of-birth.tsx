"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDate } from "@/hooks/use-user-personalization";

interface GenderProps {
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}
const getSavedDob = (): Date | undefined => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      const dateObject = parseDate(parsedUserData.dob);
      return new Date(dateObject);
    }
    return undefined;
  } catch (error) {
    console.error("Error parsing saved dob:", error);
    return undefined;
  }
};
const DateOfBirth = ({ title, setIsFormValid }: GenderProps) => {
  const [date, setDate] = useState<Date | undefined>(() => getSavedDob());
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (date) {
      const existingUserData = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );

      const updatedUserData = {
        ...existingUserData,
        dob: date.toLocaleDateString(),
      };

      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setLoading(false);
    }
  }, [date]);
  useEffect(() => {
    if (!loading && date) {
      const handleSubmit = () => {
        setIsFormValid(true);
      };
      handleSubmit();
    } else if (!loading && !date) {
      setIsFormValid(false);
    }
  }, [loading, date, setIsFormValid]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
        <Skeleton className="h-32 w-32 bg-red-100 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full ">
      <h1 className="text-2xl xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>

      <div className="w-full  mx-auto">
        <div className="flex flex-col">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                onClick={() => setPopoverOpen(true)}
                variant={"outline"}
                className={cn(
                  "w-[600px] pl-3 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Calendar
                initialFocus
                mode="single"
                captionLayout="dropdown-buttons"
                fromYear={1970}
                toYear={2023}
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate ?? undefined);
                  setPopoverOpen(false); // Close the Popover when a date is selected
                }}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          <p className="mt-2 text-sm text-gray-500">
            Your date of birth is used to calculate your age.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DateOfBirth;
