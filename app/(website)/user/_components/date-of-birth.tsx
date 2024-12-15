"use client";

import { useEffect, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
// import Select, { SingleValue, StylesConfig } from "react-select";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge, parseDate } from "@/hooks/use-user-personalization";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Form } from "@/components/ui/form";

import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
}

const userDobSchema = z.object({
  dob: z.string().optional(),
});

const DateOfBirth = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { update } = useSession();
  const form = useForm<z.infer<typeof userDobSchema>>({
    resolver: zodResolver(userDobSchema),
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (user && user.dob) {
      const userDobDate = new Date(user.dob);
      setDate(userDobDate);
      setIsFormValid(true);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setIsFormValid(!!date);
  }, [date]);

  const onSubmit = async (values: z.infer<typeof userDobSchema>) => {
    try {
      const age = calculateAge(date!.toString());
      const updatedValues = {
        dob: date,
        age: age,
      };
      const response = await axios.patch(
        "/api/user/personalization/dob",
        updatedValues
      );
      if (response.status === 200) {
        update();
        router.push(`/user/profile/`);
        toast.success("Profile updated successfully", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch {
      toast.error("Something went wrong while updating profile", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

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

  const yearOptions: Option[] = Array.from({ length: 100 }, (_, i) => ({
    value: (2023 - i).toString(),
    label: (2023 - i).toString(),
  }));

  if (!user) {
    return (
      <div className="space-y-8 mt-4 w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Date of Birth
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 mt-8 w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex gap-4">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="pt-2 bg-websecondary text-white cursor-pointer"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DateOfBirth;
