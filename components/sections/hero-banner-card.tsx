"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

import Image from "next/image";
import Container from "@/components/container";
import { Input } from "../ui/input";
import { SearchInput } from "../header/search-input";

interface BannerProps {
  banner: {
    id: number;
    title: string;
    spanTxt: string;
    description: string;
    btnTxt: string;
    image: string;
  };
  className?: string;
}

export default function HeroBannerCard({ banner, className }: BannerProps) {
  return (
    <div
      className={cn("w-full flex items-center justify-center", className)}
      style={{
        backgroundImage: `url(${banner.image})`,
        backgroundSize: "cover",
      }}
    >
      <Container>
        <div className="text-center">
          <h2 className="text-3xl lg:text-3xl xl:text-5xl mb-3 font-bold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
            {banner.title}
          </h2>

          <span className="text-sm sm:text-sm md:text-xl p-2 mb-4 rounded-full text-webprimary">
            {banner.spanTxt}
          </span>
          <SearchInput />
          <div className="mt-10"></div>
        </div>
      </Container>
    </div>
  );
}
