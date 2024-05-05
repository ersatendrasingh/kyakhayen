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

import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";

import { useSession } from "next-auth/react";

const UserProfile = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const { update } = useSession();
  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
  });
  const { isSubmitting, isValid } = form.formState;
  useEffect(() => {
    const defaultValues = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      qualification: "",
      profession: "",
      bio: "",
    };

    if (user) {
      const fullName = user.name?.split(" ");
      if (fullName && fullName.length >= 1) {
        defaultValues.firstName = fullName[0];
      }
      if (fullName && fullName.length > 1) {
        defaultValues.lastName = fullName.slice(1).join(" ");
      }
      defaultValues.email = user.email ?? "";
      defaultValues.phoneNumber = user.phoneNumber ?? "";
      defaultValues.qualification = user.qualification ?? "";
      defaultValues.profession = user.profession ?? "";
      defaultValues.bio = user.bio ?? "";
    }

    form.reset(defaultValues);
  }, [user, form]);

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
                    <FormControl>
                      <Input
                        disabled={user.isOAuth ? false : true}
                        placeholder="Phone Number"
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
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Your Qualification"
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
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Your Profession"
                        {...field}
                        className="w-full h-12 rounded-md"
                      />
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
                        placeholder="e.g. 'I am a full stack developer.'"
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
                className="pt-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 cursor-pointer"
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

export default UserProfile;
