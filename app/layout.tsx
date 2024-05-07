import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { auth } from "@/auth";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title:
    "Kya Khayen - Your Ultimate Global Recipe Hub: Desi, International, and Fusion Flavors",
  description:
    "Kya Khayen brings the best of global cuisines to your fingertips. From the warmth of Indian kitchens to the sophistication of international flavors, find inspiration for every meal. Dive into our vast collection of 5 billion+ recipes, curated with a blend of tradition and innovation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID as string} />
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID as string} />
        <body className={`${poppins.variable}`} suppressHydrationWarning={true}>
          <ConfettiProvider />
          <ToastContainer />
          <NextTopLoader
            color="#ff3c28"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={false}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #ff3c28,0 0 5px #ff3c28"
          />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
