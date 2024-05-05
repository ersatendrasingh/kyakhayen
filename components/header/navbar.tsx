"use client";

import NavbarItem from "@/components/header/navbar-item";

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

export const Navbar = () => {
  return (
    <nav className="flex justify-between items-center relative">
      <div className="flex gap-x-2">
        {navbarItems.map((item) => (
          <NavbarItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  );
};
