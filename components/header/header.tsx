"use client";

import Logo from "@/components/logo";
import Container from "@/components/container";
import { Navbar } from "@/components/header/navbar";
import Usermenu from "@/components/header/user-menu";

import SearchIcon from "@/components/header/search-icon";
import MobileMenuIcon from "@/components/header/mobile-menu-icon";
import { ModeToggle } from "@/components/mode-toggle";

export const Header = () => {
  return (
    <header className="fixed z-20 w-full border-b border-border/60 bg-background/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="py-2">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 mx-auto">
            <MobileMenuIcon />
            <Logo />
            <div className="hidden md:block">
              <Navbar />
            </div>

            <div className="flex items-center gap-4">
              <SearchIcon />
              <ModeToggle />
              <Usermenu />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};
