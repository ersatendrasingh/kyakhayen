import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/schemas";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
const ChangePassword = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    try {
      const response = await axios.post("/api/user/change-password", values);
      router.push(`/user/profile/`);
      toast.success(response.data, {
        position: "top-center",
        autoClose: 5000,
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data || error.message);
        toast.error(error.response?.data || error.message, {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        console.error("Error:", error.message);
        toast.error(error.message, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 mt-8 w-full">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="Current Password"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="New Password"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="Confirm Password"
                        {...field}
                        className="w-full h-12 rounded-md"
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
                Update Password
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePassword;
