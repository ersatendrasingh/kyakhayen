"use client";

import { ArrowRight, Leaf, Sparkles, SunMedium } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export type NavItem = {
  title: string;
  slug: string;
  imageUrl: string | null;
};

export type CuisineNavItem = NavItem & {
  _count: { recipeCuisine: number };
};

export type CategoryNavItem = {
  name: string;
  slug: string;
  imageUrl: string | null;
};

type NavbarProps = {
  mealTimes: NavItem[];
  cuisines: CuisineNavItem[];
  categories: CategoryNavItem[];
  recipeTypes: NavItem[];
};

export const Navbar = ({
  mealTimes,
  cuisines,
  categories,
  recipeTypes,
}: NavbarProps) => {
  const navControlClass =
    "site-nav-control inline-flex h-9 w-max cursor-pointer items-center justify-center rounded-full !bg-transparent px-3.5 py-1.5 text-[13px] font-semibold text-[#493b31] transition-colors hover:!bg-transparent hover:!text-primary focus:!bg-transparent focus:!text-primary data-[state=open]:!bg-transparent data-[state=open]:!text-primary";

  return (
    <nav className="site-navigation">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="gap-0">
          <NavigationMenuItem>
            <Link href="/recipes?k=summer&type=season" className={navControlClass}>
              Summer
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navControlClass}>
              Recipes
            </NavigationMenuTrigger>
            <NavigationMenuContent
              className="mega-menu"
              style={{
                left: "-154px",
                width: "min(760px, calc(100vw - 48px))",
              }}
            >
              <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-6 p-6">
                <Link
                  href="/recipes"
                  className="group relative min-h-[270px] overflow-hidden rounded-[1.4rem] bg-[#182e24]"
                >
                  <Image
                    src="/assets/images/smoothie.png"
                    alt="Explore fresh recipes"
                    fill
                    sizes="270px"
                    className="object-cover opacity-76 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13251e] via-[#13251e]/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e9c779]">
                      Cook something new
                    </p>
                    <p className="text-xl font-semibold">All recipes</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs">
                      Explore collection <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6a33]">
                    Food preferences
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/recipes?k=${category.slug}&type=category`}
                        className="mega-small-card group relative h-[112px] overflow-hidden rounded-2xl"
                      >
                        <Image
                          src={category.imageUrl || "/assets/images/default-category.jpg"}
                          alt=""
                          fill
                          sizes="150px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#201711]/80 via-transparent to-transparent" />
                        <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">
                          {category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navControlClass}>
              Mealtimes
            </NavigationMenuTrigger>
            <NavigationMenuContent
              className="mega-menu"
              style={{
                left: "-256px",
                width: "min(820px, calc(100vw - 48px))",
              }}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6a33]">
                      From sunrise to supper
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#2c211a]">
                      Cook for every moment
                    </p>
                  </div>
                  <Link
                    href="/recipes?k=summer&type=season"
                    className="inline-flex items-center gap-2 rounded-full bg-[#edf3df] px-4 py-2 text-xs font-semibold text-[#2f5132]"
                  >
                    <SunMedium className="size-4" /> Summer fresh
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {mealTimes.map((mealTime) => (
                    <Link
                      key={mealTime.slug}
                      href={`/recipes?k=${mealTime.slug}&type=mealTime`}
                      className="group"
                    >
                      <span className="relative block h-[134px] overflow-hidden rounded-2xl">
                        <Image
                          src={mealTime.imageUrl || "/meta-images/recipe-page.jpg"}
                          alt=""
                          fill
                          sizes="140px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-5 text-[#382a22] group-hover:text-primary">
                        {mealTime.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navControlClass}>
              Cuisines
            </NavigationMenuTrigger>
            <NavigationMenuContent
              className="mega-menu"
              style={{
                left: "-350px",
                width: "min(810px, calc(100vw - 48px))",
              }}
            >
              <div className="grid grid-cols-[250px_minmax(0,1fr)] gap-6 p-6">
                <Link
                  href="/recipes?k=north-indian&type=cuisine"
                  className="group relative min-h-[315px] overflow-hidden rounded-[1.35rem]"
                >
                  <Image
                    src={
                      cuisines.find((item) => item.slug === "north-indian")
                        ?.imageUrl || "/meta-images/recipe-page.jpg"
                    }
                    alt="North Indian recipes"
                    fill
                    sizes="220px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#231710]/92 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f6d08b]">
                      Most loved
                    </p>
                    <p className="mt-2 text-xl font-semibold">North Indian</p>
                  </div>
                </Link>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6a33]">
                      Taste across regions
                    </p>
                    <Sparkles className="size-4 text-[#d69a3e]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {cuisines.slice(1, 10).map((cuisine) => (
                      <Link
                        key={cuisine.slug}
                        href={`/recipes?k=${cuisine.slug}&type=cuisine`}
                        className="group flex min-w-0 items-center gap-2 rounded-xl border border-[#f0e3d1] bg-[#fffdf8] p-2.5 hover:border-[#dfb36a]"
                      >
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={cuisine.imageUrl || "/meta-images/recipe-page.jpg"}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </span>
                        <span className="truncate text-xs font-semibold text-[#45352a] group-hover:text-primary">
                          {cuisine.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/recipes?k=north-indian&type=cuisine"
                    className="mega-menu-action mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Begin with Indian favourites <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navControlClass}>
              Collections
            </NavigationMenuTrigger>
            <NavigationMenuContent
              className="mega-menu"
              style={{
                left: "-438px",
                width: "min(770px, calc(100vw - 48px))",
              }}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6a33]">
                      Browse by craving
                    </p>
                    <p className="mt-1 text-lg font-semibold">Recipe styles</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/recipes?k=summer&type=season" className="mega-chip">
                      <SunMedium className="size-3.5" /> Summer
                    </Link>
                    <Link href="/recipes?k=veg&type=category" className="mega-chip">
                      <Leaf className="size-3.5" /> Vegetarian
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {recipeTypes.map((type) => (
                    <Link
                      key={type.slug}
                      href={`/recipes?k=${type.slug}&type=recipeType`}
                      className="group relative h-[125px] overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={type.imageUrl || "/meta-images/recipe-page.jpg"}
                        alt=""
                        fill
                        sizes="145px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#21170f]/88 via-[#21170f]/12 to-transparent" />
                      <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">
                        {type.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/recipes?k=snacks&type=recipeType" className={navControlClass}>
              Quick Bites
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};
