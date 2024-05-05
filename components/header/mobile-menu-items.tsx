"use client";

import MenuItem from "@/components/header/menu-item";
import { SearchInput } from "@/components/header/search-input";

const navbarItems = [
  {
    label: "Home",
    href: "/",
    hasChild: false,
  },
  {
    label: "Recipes",
    href: "/recipes",
    hasChild: false,
  },
  {
    label: "Meals",
    href: "/recipes",
    hasChild: false,
  },
  {
    label: "Ingredients",
    href: "/recipes",
    hasChild: false,
  },
  {
    label: "Cuisines",
    href: "/recipes",
    hasChild: false,
  },
  {
    label: "Healthy Recipes",
    href: "/recipes",
    hasChild: false,
  },
];

export const MobileMenuItems = () => {
  return (
    <nav className="flex flex-col h-full border-r shadow-sm overflow-y-auto ">
      <div className="border-b p-4 mt-6">
        <SearchInput />
      </div>
      <div className="flex flex-col w-full">
        {navbarItems.map((item) => (
          <MenuItem key={item.label} label={item.label} href={item.href} />
        ))}
      </div>
    </nav>
  );
};
