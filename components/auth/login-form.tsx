"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { CardWrapper } from "@/components/auth/card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";
import { SubmitButton } from "@/components/submit-button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { collectPersonalizationData } from "@/hooks/use-user-personalization";
import axios from "axios";

interface LoginFormProps {
  callBackUrl?: string;
  mode?: "modal" | "redirect";
}

export const LoginForm = ({ callBackUrl, mode }: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callBackUrl
    ? callBackUrl
    : searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isloading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      setIsLoading(true);
      login(values, callbackUrl)
        .then(async (data) => {
          if (data?.error) {
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            setIsLoading(false);
            const needsPersonalizationUpdate = localStorage.getItem(
              "needsPersonalizationUpdate"
            );
            if (needsPersonalizationUpdate === "true") {
              const personalizationData = collectPersonalizationData();
              if (personalizationData) {
                try {
                  console.log("personalizationData", personalizationData);
                  const response = await axios.patch(
                    "/api/user/personalization",
                    personalizationData
                  );

                  localStorage.setItem("personalization", "true");
                  localStorage.removeItem("userData");
                  localStorage.removeItem("currentStep");
                  localStorage.removeItem("needsPersonalizationUpdate");
                  router.push("/user/profile");
                } catch (error) {
                  console.error("Failed to update personalization data", error);
                }
              }
            }
            localStorage.setItem("toastDisplayed", "false");
            router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled={isPending}
                          placeholder="john.doe@example.com"
                          {...field}
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          disabled={isPending}
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="px-0 font-normal"
                      >
                        <Link href="/auth/reset">Forgot password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={isloading ? "" : success} />
          <SubmitButton
            isPending={isPending}
            submitText={showTwoFactor ? "Confirm" : "Login"}
          />
        </form>
      </Form>
    </CardWrapper>
  );
};
