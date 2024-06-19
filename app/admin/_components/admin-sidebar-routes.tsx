"use client";

import {
  CookingPot,
  LayoutDashboard,
  Newspaper,
  Salad,
  SmartphoneNfc,
  Users,
  Webhook,
} from "lucide-react";
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
        label: "Manage Categories",
        href: "/admin/recipes/categories",
      },

      {
        id: 3,
        label: "Manage Cooking Methods",
        href: "/admin/recipes/cooking-methods",
      },
      {
        id: 4,
        label: "Manage Cuisines",
        href: "/admin/recipes/cuisines",
      },
      {
        id: 5,
        label: "Manage Allergies",
        href: "/admin/recipes/allergies",
      },
      {
        id: 6,
        label: "Manage Prakriti",
        href: "/admin/recipes/prakriti",
      },
      {
        id: 7,
        label: "Manage Health Goals",
        href: "/admin/recipes/health-goals",
      },
      {
        id: 8,
        label: "Manage Diseases",
        href: "/admin/recipes/diseases",
      },
      {
        id: 9,
        label: "Manage Meal Time",
        href: "/admin/recipes/meal-time",
      },
      {
        id: 10,
        label: "Manage Nutrients",
        href: "/admin/recipes/nutrients",
      },
      {
        id: 11,
        label: "Manage Diet Types",
        href: "/admin/recipes/diet-types",
      },
      {
        id: 12,
        label: "Manage Recipe Types",
        href: "/admin/recipes/recipe-types",
      },
    ],
  },

  {
    id: 3,
    icon: Salad,
    label: "Recipe Ingredients",
    href: "/admin/ingredients",
    subMenuItems: [
      {
        id: 1,
        label: "View All Ingredients",
        href: "/admin/ingredients",
      },
      {
        id: 2,
        label: "Add New ingredient",
        href: "/admin/ingredients/create",
      },
      {
        id: 3,
        label: "Manage Ingredient Forms",
        href: "/admin/ingredients/forms",
      },
      {
        id: 4,
        label: "Manage Ingredient Units",
        href: "/admin/ingredients/units",
      },
      {
        id: 5,
        label: "Manage Ingredient Categories",
        href: "/admin/ingredients/categories",
      },
    ],
  },
  {
    id: 4,
    icon: Webhook,
    label: "Manage Prakriti",
    href: "/admin/prakriti",
  },

  {
    id: 5,
    icon: Newspaper,
    label: "Articles",
    href: "/admin/articles",
    subMenuItems: [
      {
        id: 1,
        label: "View All Articles",
        href: "/admin/articles",
      },
      {
        id: 2,
        label: "Add New Article",
        href: "/admin/articles/create",
      },
      {
        id: 3,
        label: "Manage Article Categories",
        href: "/admin/articles/categories",
      },
    ],
  },
  {
    id: 6,
    icon: Users,
    label: "Manage Users",
    href: "/admin/users",
  },
  {
    id: 7,
    icon: SmartphoneNfc,
    label: "Contact Queries",
    href: "/admin/contact-queries",
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
