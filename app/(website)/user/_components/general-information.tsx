import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { userProfileSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";

const GeneralInformation = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { update } = useSession();

  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      bio: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    if (user) {
      const fullName = user.name?.split(" ") ?? [];
      const defaultValues = {
        firstName: fullName[0] ?? "",
        lastName: fullName.slice(1).join(" ") ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        bio: user.bio ?? "",
      };
      form.reset(defaultValues);
    }
  }, [user, form]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const debouncedPhoneNumber = useDebounce(phoneNumber, 500);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkPhoneNumber = async () => {
      if (debouncedPhoneNumber) {
        setIsChecking(true);
        try {
          await axios.post("/api/user/check-phone", {
            phoneNumber: debouncedPhoneNumber,
          });
          form.clearErrors("phoneNumber");
          setIsChecking(false);
        } catch (error) {
          form.setError("phoneNumber", {
            type: "manual",
            message: "Phone number already exists",
          });
          setIsChecking(false);
        }
      }
    };

    checkPhoneNumber();
  }, [debouncedPhoneNumber, form]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPhoneNumber(value);
    form.setValue("phoneNumber", value, { shouldValidate: true });
  };

  const onSubmit = async (values: z.infer<typeof userProfileSchema>) => {
    try {
      const response = await axios.patch("/api/user", values);
      update();
      router.push(`/user/profile/`);

      toast.success("Profile updated successfully", {
        position: "top-center",
        autoClose: 5000,
      });
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
        General Information
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 mt-8 w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="First Name"
                        {...field}
                        className="w-full h-12 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Last Name"
                        {...field}
                        className="w-full h-12 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={true}
                        placeholder="Email"
                        {...field}
                        className="w-full h-12 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="relative">
                      <>
                        <Input
                          placeholder="Phone Number"
                          {...field}
                          className="w-full h-12 rounded-md pr-10"
                          onChange={handlePhoneNumberChange}
                        />
                        {isChecking && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
                        )}
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        {...field}
                        placeholder="e.g. 'I am a user of kyakhayen'"
                        className="w-full h-32 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="pt-2 bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer"
              >
                Update Profile
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GeneralInformation;
