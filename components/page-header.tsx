"use client";

import { cn } from "@/lib/utils";

import Container from "@/components/container";
import PageBreadcum from "@/components/page-breadcum";

interface PageHeaderProps {
  title: string;
  className?: string;
}

export const PageHeader = ({ title, className }: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "w-full flex bg-gradient-to-r from-red-500 to-orange-500 ",
        className
      )}
    >
      <Container>
        <div className="flex items-start  justify-start">
          <div className="text-start w-full">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl mb-2 text-white font-bold transition-all duration-1000 ease-in-out transform animate-slide-in">
              {title}
            </h2>
            <PageBreadcum currentPage={title} />
          </div>
        </div>
      </Container>
    </div>
  );
};
