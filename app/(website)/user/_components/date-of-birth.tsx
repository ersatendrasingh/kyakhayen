import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge, parseDate } from "@/hooks/use-user-personalization";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const userDob = z.object({
  dob: z.string().optional(),
});

const DateOfBirth = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { update } = useSession();
  const form = useForm<z.infer<typeof userDob>>({
    resolver: zodResolver(userDob),
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
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

  const onSubmit = async (values: z.infer<typeof userDob>) => {
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
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    onClick={() => setPopoverOpen(true)}
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
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
                    toYear={2020}
                    selected={date}
                    initialMonth={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate ?? undefined);
                      setPopoverOpen(false);
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-2 text-sm text-gray-500">
                Your date of birth is used to calculate your age.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>

            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
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
