"use client";

import { FaBars, FaHome, FaSearch } from "react-icons/fa";
import { MdFoodBank } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";
import Link from "next/link";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuItems } from "@/components/header/mobile-menu-items";
import { LoginButton } from "@/components/auth/login-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SearchInput } from "@/components/header/search-input";
import { useState } from "react";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();

  return (
    <div className="fixed md:hidden z-50 bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex flex-row items-center justify-between">
        <div>
          <Sheet>
            <SheetTrigger className="flex flex-col items-center justify-center">
              <FaBars size={24} className="mb-1" />
              <span className="text-xs">Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <MobileMenuItems />
            </SheetContent>
          </Sheet>
        </div>
        <div>
          <Link href="/" className="flex flex-col items-center justify-center">
            <button className="flex flex-col items-center justify-center">
              <FaHome size={24} className="mb-1" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
        </div>
        <div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center justify-center">
              <FaSearch size={24} className="mb-1" />
              <span className="text-xs">Search</span>
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
            href="/recipes"
            className="flex flex-col items-center justify-center"
          >
            <button className="flex flex-col items-center justify-center">
              <MdFoodBank size={24} className="mb-1" />
              <span className="text-xs">Recipes</span>
            </button>
          </Link>
        </div>

        <div>
          {user ? (
            <Link href="/user/dashboard">
              <div className="flex flex-col items-center justify-center">
                <RiAccountCircleLine size={24} className="mb-1" />
                <span className="text-xs">My Account</span>
              </div>
            </Link>
          ) : (
            <LoginButton>
              <div className="flex flex-col items-center justify-center">
                <RiAccountCircleLine size={24} className="mb-1" />
                <span className="text-xs">My Account</span>
              </div>
            </LoginButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
