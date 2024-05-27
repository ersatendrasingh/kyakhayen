"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

import Container from "@/components/container";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/header/search-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DownloadOurApp from "@/components/sections/slider/download-our-app";

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
  className?: string;
}

export default function HeroBannerCard({
  banner,
  banners,
  className,
}: HeroBannerCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center overflow-hidden",
        className
      )}
      style={{
        backgroundImage: `url(${banner.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="w-full flex flex-col items-center justify-center text-center">
          <div className="hidden  w-full my-3 justify-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <div className="relative mt-3 w-full">
                  <Search className="h-6 w-6 absolute top-3 left-3 text-slate-600" />
                  <Input
                    className="w-full md:w-[600px] h-12 pl-16 rounded-full bg-white shadow-md"
                    placeholder="Search for recipes..."
                  />
                </div>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="flex flex-row items-center justify-center"
              >
                <SearchInput onClose={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full h-full flex items-center justify-center">
            <DownloadOurApp banners={banners} />
          </div>
        </div>
      </Container>
    </div>
  );
}
