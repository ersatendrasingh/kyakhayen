"use client";

import { cn } from "@/lib/utils";
import Container from "@/components/container";

import HomeSlideBanner from "@/components/sections/slider/home-slide-banner";
import Image from "next/image";

interface HeroBannerCardProps {
  banner: {
    id: number;
    title: string;
    spanTxt: string;
    btnTxt: string;
    image: string;
  };
  banners: {
    id: number;
    title: string;
    spanTxt: string;
    btnTxt: string;
    image: string;
    points?: string[];
    href?: string;
  }[];
  featureBanners: {
    id: number;
    title: string;
    spanTxt: string;
    btnTxt: string;
    image: string;
    points?: string[];
    href?: string;
  }[];
  className?: string;
}

export default function HeroBannerCard({
  banner,
  banners,
  featureBanners,
  className,
}: HeroBannerCardProps) {
  const isPWA = () => window.matchMedia("(display-mode: standalone)").matches;

  const renderBanner = () => {
    try {
      if (typeof window !== "undefined" && isPWA()) {
        return <HomeSlideBanner banners={featureBanners} />;
      } else {
        return <HomeSlideBanner banners={banners} />;
      }
    } catch (error) {
      console.error("Error rendering banner:", error);
      return <div>Error loading banner</div>;
    }
  };

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center overflow-hidden",
        className
      )}
    >
      <Container>
        <div className="w-full flex flex-col items-center justify-center text-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={banner.image} // Your banner image
                alt="Banner Image"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                priority // Ensures the banner image is prioritized for faster LCP
              />
            </div>
            {renderBanner()}
          </div>
        </div>
      </Container>
    </div>
  );
}
