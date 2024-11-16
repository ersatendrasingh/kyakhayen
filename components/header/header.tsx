"use client";

import Logo from "@/components/logo";
import Container from "@/components/container";
import { Navbar } from "@/components/header/navbar";
import Usermenu from "@/components/header/user-menu";

import SearchIcon from "@/components/header/search-icon";
import MobileMenuIcon from "@/components/header/mobile-menu-icon";

export const Header = () => {
  return (
    <header className="fixed w-full bg-white shadow-sm z-20">
      <div className="py-2 border-b-[1px]">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 mx-auto">
            <MobileMenuIcon />
            <Logo />
            <div className="hidden md:block">
              <Navbar />
            </div>

            <div className="flex items-center gap-4">
              <SearchIcon />
              <Usermenu />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};
