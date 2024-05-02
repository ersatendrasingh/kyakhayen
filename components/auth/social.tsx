"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-center mt-2">
        <h2 className="text-md text-muted-foreground mb-3">or continue with</h2>
      </div>
      <div className="w-full flex items-center justify-center gap-x-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => onClick("google")}
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          <span className="font-bold">Login with Google</span>
        </Button>
        {/* <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => onClick("github")}
        >
          <FaGithub className="w-5 h-5" />
        </Button> */}
      </div>
    </div>
  );
};
