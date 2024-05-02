"use client";

import { useRouter } from "next/navigation";

import { logout } from "@/actions/logout";

interface LogoutButtonProps {
  children?: React.ReactNode;
  callbackUrl?: string;
}

export const LogoutButton = ({ children, callbackUrl }: LogoutButtonProps) => {
  const router = useRouter();
  const onClick = async () => {
    await logout();
    const encodedCallbackUrl = encodeURIComponent(callbackUrl || "");
    router.push("/auth/login?callbackUrl=" + encodedCallbackUrl);
  };

  return (
    <div onClick={onClick} className="w-full cursor-pointer">
      {children}
    </div>
  );
};
