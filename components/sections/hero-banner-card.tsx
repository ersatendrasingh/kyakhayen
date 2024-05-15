"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

import Image from "next/image";
import Container from "@/components/container";
import { Input } from "../ui/input";
import { SearchInput } from "../header/search-input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { FaSearch } from "react-icons/fa";
import { Search } from "lucide-react";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn("w-full flex items-center justify-center", className)}
      style={{
        backgroundImage: `url(${banner.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="w-full text-center">
          <h1 className="text-3xl lg:text-3xl xl:text-5xl mb-3 font-bold transition-all duration-1000 ease-in-out transform animate-slide-in text-websecondary">
            {banner.title}
          </h1>

          <span className="text-sm sm:text-sm md:text-xl p-2 mb-4 rounded-full text-black">
            {banner.spanTxt}
          </span>
          {/* <SearchInput /> */}
          <div className="pt-10 relative">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="flex-col items-center justify-center hidden md:flex">
                <Search className="h-6 w-6 absolute top-13 left-3 text-slate-600" />
                <Input
                  className="w-full md:w-[600px] h-12 pl-16 rounded-full bg-white"
                  placeholder="Search for recipes..."
                />
              </SheetTrigger>
              <SheetContent
                side="top"
                className="flex flex-row items-center justify-center"
              >
                <SearchInput onClose={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <div className="mt-10"></div>
        </div>
      </Container>
    </div>
  );
}
