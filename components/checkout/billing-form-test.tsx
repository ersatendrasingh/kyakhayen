"use client";

import { useFormContext } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BillingFormProps {
  isSubmitting: boolean;
}

const BillingFormTest = ({ isSubmitting }: BillingFormProps) => {
  const { control, formState, getValues } = useFormContext();

  return (
    <div className="w-full flex flex-col items-start justify-start bg-white rounded-md p-4 shadow-sm transition mb-10">
      <h1 className="text-2xl font-bold">Billing Address</h1>
      <div className="space-y-8 mt-8 w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="billing_firstName"
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
            control={control}
            name="billing_lastName"
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
          <FormField
            control={control}
            name="billing_email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
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
            control={control}
            name="billing_phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <>
                    <div className="flex items-center">
                      <div className="w-1/6 mr-2"></div>
                      <div className="w-5/6">
                        <Input
                          disabled={isSubmitting}
                          placeholder="Phone Number"
                          {...field}
                          className="w-full h-12 rounded-md"
                        />
                      </div>
                    </div>
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="billing_address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    disabled={isSubmitting}
                    {...field}
                    placeholder="e.g. 'House number, street name'"
                    className="w-full h-32 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="billing_zip"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Zip"
                    {...field}
                    className="w-full h-12 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingFormTest;
