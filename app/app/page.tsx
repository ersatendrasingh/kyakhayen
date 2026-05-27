import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PwaWelcome } from "@/components/pwa/pwa-welcome";

export const metadata: Metadata = {
  title: "Welcome to Kya Khayen",
  robots: { index: false, follow: false },
};

export default async function InstalledAppEntryPage() {
  const session = await auth();

  if (session?.user) {
    redirect(session.user.isPersonalised ? "/meal-plan" : "/user/dashboard");
  }

  return <PwaWelcome />;
}
