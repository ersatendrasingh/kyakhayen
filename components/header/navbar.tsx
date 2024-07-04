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
    label: "Articles",
    href: "/blog",
    hasChild: false,
  },
  {
    label: "Meals",
    href: "/recipes",
    hasChild: true,
    children: [
      {
        label: "Breakfast",
        href: "/recipes?k=breakfast&type=mealTime",
      },
      {
        label: "Mid Morning",
        href: "/recipes?k=mid-morning&type=mealTime",
      },
      {
        label: "Lunch",
        href: "/recipes?k=lunch&type=mealTime",
      },
      {
        label: "Evening",
        href: "/recipes?k=evening&type=mealTime",
      },
      {
        label: "Dinner",
        href: "/recipes?k=dinner&type=mealTime",
      },
    ],
  },
  {
    label: "Cuisines",
    href: "/recipes",
    hasChild: false,
  },
  {
    label: "Meal Plan",
    href: "/meal-plan",
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
