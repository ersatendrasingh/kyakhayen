"use client";

import { ChevronDown, Leaf, Sparkles, SunMedium } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/logo";
import Usermenu from "@/components/header/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { SheetClose } from "@/components/ui/sheet";
import type {
  CategoryNavItem,
  CuisineNavItem,
  NavItem,
} from "@/components/header/navbar";

type MobileMenuItemsProps = {
  mealTimes: NavItem[];
  cuisines: CuisineNavItem[];
  categories: CategoryNavItem[];
  recipeTypes: NavItem[];
  cookingMethods: NavItem[];
  dietTypes: NavItem[];
};

type DrawerLink = {
  label: string;
  href: string;
};

function DrawerGroup({
  label,
  kicker,
  links,
}: {
  label: string;
  kicker: string;
  links: DrawerLink[];
}) {
  return (
    <details className="group border-b border-[#eadbc8]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-[#45362c] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#a2773d]">
            {kicker}
          </span>
          <span className="mt-1 block">{label}</span>
        </span>
        <ChevronDown className="size-4 text-[#997c5c] transition group-open:rotate-180" />
      </summary>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {links.map((link) => (
          <SheetClose asChild key={link.href}>
            <Link
              href={link.href}
              className="cursor-pointer rounded-xl border border-[#eadbc8] bg-white px-3 py-3 text-xs font-medium text-[#59483c] transition hover:border-[#daa64f] hover:text-primary"
            >
              {link.label}
            </Link>
          </SheetClose>
        ))}
      </div>
    </details>
  );
}

export const MobileMenuItems = ({
  mealTimes,
  cuisines,
  categories,
  recipeTypes,
  cookingMethods,
  dietTypes,
}: MobileMenuItemsProps) => {
  return (
    <nav className="mobile-discovery-drawer flex h-full flex-col overflow-y-auto">
      <div className="border-b border-[#eadbc8] px-5 pb-4 pt-5">
        <Logo />
        <p className="mt-3 text-xs leading-5 text-[#79695e]">
          Beautiful everyday food, chosen around your taste.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-[#eadbc8] p-4">
        <SheetClose asChild>
          <Link
            href="/recipes?k=summer&type=season"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#edf3df] px-3 py-3 text-xs font-semibold text-[#315036]"
          >
            <SunMedium className="size-4" /> Summer
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/recipes?k=snacks&type=recipeType"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#f7e9db] px-3 py-3 text-xs font-semibold text-primary"
          >
            <Sparkles className="size-4" /> Quick Bites
          </Link>
        </SheetClose>
      </div>

      <SheetClose asChild>
        <Link
          href="/blog"
          className="mx-4 mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-[#eadbc8] bg-white px-4 py-4 text-sm font-semibold text-[#45362c]"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-[#bd8030]" /> Food journal
          </span>
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </SheetClose>

      <DrawerGroup
        label="Recipes"
        kicker="Choose your plate"
        links={[
          { label: "All recipes", href: "/recipes" },
          ...categories.slice(0, 5).map((category) => ({
            label: category.name,
            href: `/recipes?k=${category.slug}&type=category`,
          })),
        ]}
      />
      <DrawerGroup
        label="Mealtimes"
        kicker="Cook by moment"
        links={mealTimes.slice(0, 6).map((mealTime) => ({
          label: mealTime.title,
          href: `/recipes?k=${mealTime.slug}&type=mealTime`,
        }))}
      />
      <DrawerGroup
        label="Cuisines"
        kicker="Taste across India"
        links={cuisines.slice(0, 8).map((cuisine) => ({
          label: cuisine.title,
          href: `/recipes?k=${cuisine.slug}&type=cuisine`,
        }))}
      />
      <DrawerGroup
        label="Collections"
        kicker="Browse by craving"
        links={[
          {
            label: "Vegetarian",
            href: "/recipes?k=veg&type=category",
          },
          ...recipeTypes.slice(0, 5).map((type) => ({
            label: type.title,
            href: `/recipes?k=${type.slug}&type=recipeType`,
          })),
        ]}
      />
      <DrawerGroup
        label="Cooking Methods"
        kicker="Choose technique"
        links={cookingMethods.slice(0, 6).map((method) => ({
          label: method.title,
          href: `/recipes?k=${method.slug}&type=cookingMethod`,
        }))}
      />
      <DrawerGroup
        label="Wellness Goals"
        kicker="Eat your way"
        links={dietTypes.slice(0, 6).map((dietType) => ({
          label: dietType.title,
          href: `/recipes?k=${dietType.slug}&type=dietType`,
        }))}
      />

      <SheetClose asChild>
        <Link
          href="/recipes?k=veg&type=category"
          className="mx-4 mt-4 flex cursor-pointer items-center justify-between rounded-2xl bg-[#17372b] px-4 py-4 text-sm font-semibold text-white"
        >
          <span className="inline-flex items-center gap-2">
            <Leaf className="size-4 text-[#d8edc4]" /> Explore vegetarian
          </span>
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </SheetClose>

      <div className="mt-auto border-t border-[#eadbc8] bg-[#fff7ec] p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a2773d]">
          Your kitchen
        </p>
        <div className="flex items-center justify-between rounded-2xl border border-[#eadbc8] bg-white p-3">
          <div className="flex items-center gap-2.5">
            <Usermenu variant="mobile" />
            <span className="text-xs font-semibold text-[#504035]">
              Account & preferences
            </span>
          </div>
          <div className="flex items-center text-[#7c6756]">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
