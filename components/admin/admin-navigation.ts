import {
  BadgeCent,
  BadgeDollarSign,
  CookingPot,
  LayoutDashboard,
  MessageSquareCode,
  Newspaper,
  Salad,
  SmartphoneNfc,
  Stars,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: Array<{
    title: string;
    href: string;
  }>;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigation: AdminNavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "Recipes",
        href: "/admin/recipes",
        icon: CookingPot,
        children: [
          { title: "All Recipes", href: "/admin/recipes" },
          { title: "Categories", href: "/admin/recipes/categories" },
          { title: "Cooking Methods", href: "/admin/recipes/cooking-methods" },
          { title: "Body Types", href: "/admin/recipes/body-types" },
          { title: "Cuisines", href: "/admin/recipes/cuisines" },
          { title: "Allergies", href: "/admin/recipes/allergies" },
          { title: "Meal Times", href: "/admin/recipes/meal-time" },
          { title: "Nutrients", href: "/admin/recipes/nutrients" },
          { title: "Diet Types", href: "/admin/recipes/diet-types" },
          { title: "Recipe Types", href: "/admin/recipes/recipe-types" },
        ],
      },
      {
        title: "Ingredients",
        href: "/admin/ingredients",
        icon: Salad,
        children: [
          { title: "All Ingredients", href: "/admin/ingredients" },
          { title: "Add Ingredient", href: "/admin/ingredients/create" },
          { title: "Forms", href: "/admin/ingredients/forms" },
          { title: "Units", href: "/admin/ingredients/units" },
          { title: "Categories", href: "/admin/ingredients/categories" },
        ],
      },
      {
        title: "Articles",
        href: "/admin/articles",
        icon: Newspaper,
        children: [
          { title: "All Articles", href: "/admin/articles" },
          { title: "Add Article", href: "/admin/articles/create" },
          { title: "Categories", href: "/admin/articles/categories" },
        ],
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        title: "Coupons",
        href: "/admin/coupons",
        icon: BadgeCent,
      },
      {
        title: "Subscription Plans",
        href: "/admin/subscription-plans",
        icon: BadgeDollarSign,
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        title: "Comments",
        href: "/admin/comments",
        icon: MessageSquareCode,
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Stars,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Contact Queries",
        href: "/admin/contact-queries",
        icon: SmartphoneNfc,
      },
    ],
  },
];
