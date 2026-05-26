"use client";

import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileMenuItems } from "@/components/header/mobile-menu-items";
import type {
  CategoryNavItem,
  CuisineNavItem,
  NavItem,
} from "@/components/header/navbar";

type MobileMenuIconProps = {
  mealTimes: NavItem[];
  cuisines: CuisineNavItem[];
  categories: CategoryNavItem[];
  recipeTypes: NavItem[];
  cookingMethods: NavItem[];
  dietTypes: NavItem[];
};

const MobileMenuIcon = ({
  mealTimes,
  cuisines,
  categories,
  recipeTypes,
  cookingMethods,
  dietTypes,
}: MobileMenuIconProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openMenu = () => setOpen(true);

    window.addEventListener("kyakhayen:open-mobile-menu", openMenu);

    return () => window.removeEventListener("kyakhayen:open-mobile-menu", openMenu);
  }, []);

  return (
    <div className="block lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open discovery menu"
          className="website-menu-trigger flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#e7d6c2] bg-[#fffaf1] transition hover:border-[#d8bb8e]"
        >
          <FaBars className="size-4 text-[#665548]" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="mobile-discovery-sheet w-[min(88vw,365px)] gap-0 border-[#ebddca] bg-[#fffaf2] p-0"
        >
          <SheetTitle className="sr-only">Discover recipes</SheetTitle>
          <SheetDescription className="sr-only">
            Browse recipes, cuisines, mealtimes and collections.
          </SheetDescription>
          <MobileMenuItems
            mealTimes={mealTimes}
            cuisines={cuisines}
            categories={categories}
            recipeTypes={recipeTypes}
            cookingMethods={cookingMethods}
            dietTypes={dietTypes}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenuIcon;
