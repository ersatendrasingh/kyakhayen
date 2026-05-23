"use client";

import { FaHome, FaSearch, FaRegCalendarAlt } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";

import { RiAccountCircleLine } from "react-icons/ri";
import Link from "next/link";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LoginButton } from "@/components/auth/login-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SearchInput } from "@/components/header/search-input";
import { useState } from "react";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-2 text-muted-foreground backdrop-blur md:hidden">
      <div className="flex flex-row items-center justify-between">
        <div>
          <Link href="/" className="flex flex-col items-center justify-center">
            <button className="flex flex-col items-center justify-center">
              <FaHome size={24} className="mb-1" />
            </button>
          </Link>
        </div>
        <div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center justify-center">
              <FaSearch size={24} className="mb-1" />
            </SheetTrigger>
            <SheetContent
              side="top"
              className="flex flex-row items-center justify-center w-full"
            >
              <SearchInput onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        <div>
          <Link
            href="/meal-plan"
            className="flex flex-col items-center justify-center"
          >
            <button className="flex flex-col items-center justify-center">
              <FaRegCalendarAlt size={24} className="mb-1" />
            </button>
          </Link>
        </div>
        <div>
          <Link
            href="/recipes"
            className="flex flex-col items-center justify-center"
          >
            <button className="flex flex-col items-center justify-center">
              <MdFoodBank size={24} className="mb-1" />
            </button>
          </Link>
        </div>

        <div>
          {user ? (
            <Link href="/user/dashboard">
              <div className="flex flex-col items-center justify-center">
                <RiAccountCircleLine size={24} className="mb-1" />
              </div>
            </Link>
          ) : (
            <LoginButton>
              <div className="flex flex-col items-center justify-center">
                <RiAccountCircleLine size={24} className="mb-1" />
              </div>
            </LoginButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
