"use client";

import {
  BookOpenText,
  CalendarDays,
  LayoutGrid,
  MapPinned,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Container from "@/components/container";
import Logo from "@/components/logo";
import { Navbar } from "@/components/header/navbar";
import { SearchInput } from "@/components/header/search-input";
import Usermenu from "@/components/header/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  CategoryNavItem,
  CuisineNavItem,
  NavItem,
} from "@/components/header/navbar";

type DesktopHeaderProps = {
  mealTimes: NavItem[];
  cuisines: CuisineNavItem[];
  categories: CategoryNavItem[];
  recipeTypes: NavItem[];
};

type PanelId = "recipes" | "mealtimes" | "cuisines" | "collections";

function CatalogueMenu({
  mealTimes,
  cuisines,
  categories,
  recipeTypes,
  collapsed,
}: DesktopHeaderProps & { collapsed: boolean }) {
  const [activePanel, setActivePanel] = useState<PanelId>("recipes");
  const panels = [
    { id: "recipes" as const, label: "Recipes", kicker: "Find a plate", icon: BookOpenText },
    { id: "mealtimes" as const, label: "Mealtimes", kicker: "Cook by moment", icon: CalendarDays },
    { id: "cuisines" as const, label: "Cuisines", kicker: "Explore regions", icon: MapPinned },
    { id: "collections" as const, label: "Collections", kicker: "Browse cravings", icon: Sparkles },
  ];

  return (
    <div
      className={`absolute left-[calc(50%_-_348px)] top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
        collapsed
          ? "pointer-events-auto translate-x-0 scale-100 opacity-100 delay-150"
          : "pointer-events-none translate-x-10 scale-75 opacity-0 delay-0"
      }`}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open recipe catalogue"
            className="website-catalogue-trigger flex size-[42px] cursor-pointer items-center justify-center rounded-full border border-[#ead9c3] bg-white text-[#59483c] shadow-sm transition hover:border-[#d9aa60] hover:bg-[#fff8ed] hover:text-primary focus:outline-none focus-visible:border-[#d0a554]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a554]/20"
          >
            <LayoutGrid className="size-[18px]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={10}
          className="website-catalogue-menu grid w-[760px] grid-cols-[208px_minmax(0,1fr)] gap-4 rounded-[1.5rem] border-[#eadbc8] bg-[#fffaf2] p-4 shadow-[0_30px_76px_-32px_rgba(48,30,18,0.52)]"
        >
          <div className="border-r border-[#eee0cc] pr-3">
            <p className="flex items-center gap-2 px-3 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a2773d]">
              <Sparkles className="size-3" /> Catalogue
            </p>
            {panels.map(({ id, label, kicker, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onMouseEnter={() => setActivePanel(id)}
                onFocus={() => setActivePanel(id)}
                className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  activePanel === id
                    ? "bg-[#f3e5d1] text-primary dark:bg-[#19342b] dark:text-[#e3ba69]"
                    : "text-[#554438] hover:bg-[#f8eddd] dark:text-[#e1e9e3] dark:hover:bg-[#162f27]"
                }`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-[10px] text-[#897565] dark:text-[#a4b3ab]">{kicker}</span>
                </span>
              </button>
            ))}
          </div>

          {activePanel === "recipes" && (
            <div className="grid grid-cols-[1.08fr_1fr] gap-3">
              <Link
                href="/recipes"
                className="group relative min-h-[236px] overflow-hidden rounded-2xl"
              >
                <Image
                  src="/assets/images/smoothie.png"
                  alt=""
                  fill
                  sizes="290px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14261e]/94 via-transparent to-transparent" />
                <span className="absolute inset-x-4 bottom-4 text-base font-semibold text-white">
                  Explore all recipes
                </span>
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.slice(0, 4).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/recipes?k=${item.slug}&type=category`}
                    className="relative overflow-hidden rounded-xl bg-[#eee1d0]"
                  >
                    <Image
                      src={item.imageUrl || "/assets/images/default-category.jpg"}
                      alt=""
                      fill
                      sizes="130px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute inset-x-2 bottom-2 text-xs font-semibold text-white">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {activePanel === "mealtimes" && (
            <div className="grid grid-cols-3 gap-3">
              {mealTimes.slice(0, 6).map((item) => (
                <Link
                  key={item.slug}
                  href={`/recipes?k=${item.slug}&type=mealTime`}
                  className="group"
                >
                  <span className="relative block h-[84px] overflow-hidden rounded-xl bg-[#ede1d2]">
                    <Image
                      src={item.imageUrl || "/meta-images/recipe-page.jpg"}
                      alt=""
                      fill
                      sizes="170px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-[#43342b] group-hover:text-primary">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {activePanel === "cuisines" && (
            <div className="grid grid-cols-3 gap-2.5">
              {cuisines.slice(0, 9).map((item) => (
                <Link
                  key={item.slug}
                  href={`/recipes?k=${item.slug}&type=cuisine`}
                  className="flex items-center gap-2.5 rounded-xl border border-[#eddfcd] bg-white p-2.5 hover:border-[#d9ab61]"
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#eee2d5]">
                    <Image
                      src={item.imageUrl || "/meta-images/recipe-page.jpg"}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                  <span className="truncate text-xs font-semibold text-[#493a30]">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {activePanel === "collections" && (
            <div className="grid grid-cols-3 gap-3">
              {recipeTypes.slice(0, 6).map((item) => (
                <Link
                  key={item.slug}
                  href={`/recipes?k=${item.slug}&type=recipeType`}
                  className="group relative h-[108px] overflow-hidden rounded-xl"
                >
                  <Image
                    src={item.imageUrl || "/meta-images/recipe-page.jpg"}
                    alt=""
                    fill
                    sizes="170px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#21170f]/88 to-transparent" />
                  <span className="absolute inset-x-3 bottom-3 text-xs font-semibold text-white">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function DesktopHeader({
  mealTimes,
  cuisines,
  categories,
  recipeTypes,
}: DesktopHeaderProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 42);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-40 hidden border-b border-[#eadbc9]/80 bg-[#fffdf7]/96 backdrop-blur-xl lg:block ${
        collapsed ? "site-header-collapsed" : "site-header-expanded"
      }`}
    >
      <Container>
        <div className="relative z-20 flex h-[58px] items-center justify-between">
          <Logo compact />
          <CatalogueMenu
            collapsed={collapsed}
            mealTimes={mealTimes}
            cuisines={cuisines}
            categories={categories}
            recipeTypes={recipeTypes}
          />
          <SearchInput
            dense
            autoFocus={false}
            className="absolute left-1/2 w-[min(570px,calc(100%_-_340px))] -translate-x-1/2"
          />
          <Usermenu variant="mobile" />
        </div>
      </Container>
      <div
        className={`desktop-nav-rail relative z-10 origin-top transition-all duration-500 ease-out ${
          collapsed
            ? "pointer-events-none h-0 -translate-y-3 scale-x-[0.72] opacity-0 blur-[2px]"
            : "h-[42px] translate-y-0 scale-x-100 border-t border-[#efe3d5] bg-[#fffaf2]/76 opacity-100 blur-0"
        }`}
      >
        <Container>
          <div className="flex h-[42px] items-center justify-center">
            <Navbar
              mealTimes={mealTimes}
              cuisines={cuisines}
              categories={categories}
              recipeTypes={recipeTypes}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}
