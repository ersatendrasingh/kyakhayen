"use client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { toast } from "sonner";
const DashboardPage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const hasToastBeenDisplayed = localStorage.getItem("toastDisplayed");
    if (hasToastBeenDisplayed !== "true") {
      const timeoutId = setTimeout(() => {
        toast.success(
          "Welcome, " +
            user?.name +
            "! 🎉 You are logged in now as a " +
            user?.role +
            " Role."
        );
        localStorage.setItem("toastDisplayed", "true");
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  });
  return <div>DashboardPage(Protected) {JSON.stringify(user)}</div>;
};

export default DashboardPage;
