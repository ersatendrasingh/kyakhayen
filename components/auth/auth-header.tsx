"use client";

import Logo from "@/components/logo";

interface AuthHeaderProps {
  label: string;
}

export const AuthHeader = ({ label }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col gap-y-4 items-center justify-center">
      <Logo />
      <h2 className="text-md text-muted-foreground">{label}</h2>
    </div>
  );
};
