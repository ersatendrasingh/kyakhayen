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
    label: "Courses",
    href: "/courses",
    hasChild: false,
  },
  {
    label: "Alumni",
    href: "/alumni",
    hasChild: false,
  },
  {
    label: "Student Speaks",
    href: "/student-speaks",
    hasChild: false,
  },
  {
    label: "Career",
    href: "/career",
    hasChild: false,
  },
  {
    label: "Faculty",
    href: "/faculty",
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
