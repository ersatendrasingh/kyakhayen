"use client";

import { CookingPot, LayoutDashboard } from "lucide-react";
import { AdminSidebarItem } from "./admin-sidebar-item";

const routes = [
  {
    id: 1,
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    id: 2,
    icon: CookingPot,
    label: "Recipes",
    href: "/admin/recipes",
    subMenuItems: [
      {
        id: 1,
        label: "View All Recipes",
        href: "/admin/recipes",
      },
      {
        id: 2,
        label: "Add New Recipe",
        href: "/admin/recipes/create",
      },
      {
        id: 3,
        label: "Categories",
        href: "/admin/recipes/categories",
      },
      {
        id: 4,
        label: "Manage Units",
        href: "/admin/recipes/units",
      },
      {
        id: 5,
        label: "Manage Cooking Methods",
        href: "/admin/recipes/cooking-methods",
      },
      {
        id: 6,
        label: "Manage Cuisines",
        href: "/admin/recipes/cuisines",
      },
      {
        id: 7,
        label: "Manage Allergies",
        href: "/admin/recipes/allergies",
      },
      {
        id: 8,
        label: "Manage Prakriti",
        href: "/admin/recipes/prakriti",
      },
    ],
  },
  {
    id: 3,
    icon: CookingPot,
    label: "Coupons",
    href: "/admin/coupons",
    subMenuItems: [
      {
        id: 1,
        label: "View All Coupons",
        href: "/admin/coupons",
      },
      {
        id: 2,
        label: "Add New coupon",
        href: "/admin/coupons/create",
      },
    ],
  },
];
export const AdminSidebarRoutes = () => {
  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <AdminSidebarItem
          key={route.id}
          icon={route.icon}
          label={route.label}
          href={route.href}
          subMenuItems={route.subMenuItems}
        />
      ))}
    </div>
  );
};
