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
import { CartProvider } from "@/context/cart-context";
import { UserCountryProvider } from "@/context/user-country-context";
import InstallPrompt from "@/components/install-prompt";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const meta = {
  title: "Kya Khayen | Healthy Recipes & Meal Plans for Weight Loss",
  description:
    "Explore healthy recipes, weight loss meal plans, and pregnancy diet charts. Find vegetarian recipes, healthy snacks for kids, and personalized weight loss programs.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/home.png`,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: meta.title,
  description: meta.description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: process.env.NEXT_PUBLIC_APP_URL,
    locale: "en-US",
    siteName: meta.title,
    type: "website",
    images: [
      {
        url: meta.image,
        width: 1200,
        height: 630,
        alt: meta.title,
      },
    ],
  },
  twitter: {
    title: meta.title,
    description: meta.description,
    images: [meta.image],
    card: "summary_large_image",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
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
          <InstallPrompt />
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
          <UserCountryProvider>
            <CartProvider>{children}</CartProvider>
          </UserCountryProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
