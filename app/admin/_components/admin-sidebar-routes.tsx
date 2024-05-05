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
        label: "Manage Categories",
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
      {
        id: 9,
        label: "Manage Health Goals",
        href: "/admin/recipes/health-goals",
      },
      {
        id: 10,
        label: "Manage Diseases",
        href: "/admin/recipes/diseases",
      },
      {
        id: 11,
        label: "Manage Meal Time",
        href: "/admin/recipes/meal-time",
      },
      {
        id: 12,
        label: "Manage Nutrients",
        href: "/admin/recipes/nutrients",
      },
      {
        id: 13,
        label: "Manage Diet Types",
        href: "/admin/recipes/diet-types",
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
