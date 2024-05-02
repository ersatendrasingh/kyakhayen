"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export const AdminMobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu size={22} />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
};
