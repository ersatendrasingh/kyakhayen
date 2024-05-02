"use client";

import { FaBars } from "react-icons/fa";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuItems } from "@/components/header/mobile-menu-items";
const MobileMenuIcon = () => {
  return (
    <div className="block md:hidden rounded-full border border-slate-300 p-3">
      <Sheet>
        <SheetTrigger className="flex flex-col items-center justify-center">
          <FaBars className="w-4 h-4 text-gray-500" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <MobileMenuItems />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenuIcon;
