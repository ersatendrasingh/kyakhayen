import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { auth } from "@/auth";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/cart-context";
import { UserCountryProvider } from "@/context/user-country-context";
import InstallPrompt from "@/components/install-prompt";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const meta = {
  title: "Kya Khayen | Recipes & Everyday Meal Plans",
  description:
    "Explore Indian and international recipes, easy meal plans, vegetarian ideas, snacks for kids, and personalized cooking inspiration.",
  image: `${process.env.NEXT_PUBLIC_APP_URL}/meta-images/home.png`,
};

export const metadata: Metadata = {
  applicationName: "Kya Khayen",
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
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/pwa/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#10231c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable}`}>
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID as string} />
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConfettiProvider />
            <Toaster position="bottom-right" />
            <InstallPrompt />
            <NextTopLoader
              color="var(--primary)"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={false}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px var(--primary), 0 0 5px var(--primary)"
            />
            <UserCountryProvider>
              <CartProvider>{children}</CartProvider>
            </UserCountryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
