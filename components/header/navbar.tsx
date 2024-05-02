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
    href: "/meals",
    hasChild: false,
  },
  {
    label: "Ingredients",
    href: "/ingredients",
    hasChild: false,
  },
  {
    label: "Cuisines",
    href: "/cusines",
    hasChild: false,
  },
  {
    label: "Healthy Lifestyle",
    href: "/helthy-lifestyle",
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
