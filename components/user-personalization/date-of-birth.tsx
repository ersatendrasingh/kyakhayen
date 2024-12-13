"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonalizationSkelton } from "@/components/user-personalization/personalization-skelton";
import { parseDate } from "@/hooks/use-user-personalization";
import { cn } from "@/lib/utils";
import useWindowSize from "@/hooks/use-window-size";

interface GenderProps {
  title: string;
  setIsFormValid: (isValid: boolean) => void;
}

interface Option {
  value: string;
  label: string;
}

const getSavedDob = (): Date | undefined => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.dob) {
        const dateObject = parseDate(parsedUserData.dob);
        return new Date(dateObject);
      }
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
  const { width } = useWindowSize();
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
      setIsFormValid(true);
    } else if (!loading && !date) {
      setIsFormValid(false);
    }
  }, [loading, date, setIsFormValid]);

  const handleSelectDay = (selectedOption: string) => {
    if (selectedOption) {
      const selectedDate = new Date(date ?? new Date());
      selectedDate.setDate(parseInt(selectedOption));
      setDate(selectedDate);
    }
  };

  const handleSelectMonth = (selectedOption: string) => {
    if (selectedOption) {
      const selectedDate = new Date(date ?? new Date());
      selectedDate.setMonth(parseInt(selectedOption) - 1);
      setDate(selectedDate);
    }
  };

  const handleSelectYear = (selectedOption: string) => {
    if (selectedOption) {
      const selectedDate = new Date(date ?? new Date());
      selectedDate.setFullYear(parseInt(selectedOption));
      setDate(selectedDate);
    }
  };

  const dayOptions: Option[] = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthOptions: Option[] = monthNames.map((month, i) => ({
    value: (i + 1).toString(),
    label: month,
  }));

  const yearOptions: Option[] = Array.from({ length: 80 }, (_, i) => ({
    value: (2020 - i).toString(),
    label: (2020 - i).toString(),
  }));
  const isMobile = width !== undefined && width <= 767;

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? "#CCCCCC" : "#E2E8F0", // Your custom border color
      boxShadow: state.isFocused ? "0 0 0 1px #CCCCCC" : "none",
      "&:hover": {
        borderColor: "#CCCCCC", // Your custom border color on hover
      },
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  if (loading) {
    return <PersonalizationSkelton />;
  }

  return (
    <div>
      <h1 className="text-2xl xl:text-3xl mb-3 font-semibold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
        {title}
      </h1>

      <div
        className={cn(
          "flex flex-row gap-x-3 w-full md:w-[380px]  items-center justify-center",
          isMobile && "w-[320px]"
        )}
      >
        <Select
          onValueChange={(value) => handleSelectDay(value)}
          value={date ? date.getDate().toString() : ""}
        >
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((option) => {
              return (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => handleSelectMonth(value)}
          value={date ? (date.getMonth() + 1).toString() : ""}
        >
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => {
              return (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => handleSelectYear(value)}
          value={date ? date.getFullYear().toString() : ""}
        >
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((option) => {
              return (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Your date of birth is used to calculate your age.
      </p>
    </div>
  );
};

export default DateOfBirth;
