"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import Container from "@/components/container";
import { FoodPreferenceMarker } from "@/components/recipes/food-preference-marker";
import {
  RecipeSteam,
  shouldShowRecipeSteam,
} from "@/components/recipes/recipe-steam";
import { useHomePreference } from "@/components/sections/home-preference-context";

import type { DiscoveryRecipe } from "./home-discovery";

export type CuisineStory = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  recipes: DiscoveryRecipe[];
};

type HomeCuisineExplorerProps = {
  cuisines: CuisineStory[];
};

function recipeHref(recipe: DiscoveryRecipe) {
  return recipe.metaSlug
    ? `/${recipe.slug}-${recipe.metaSlug}`
    : `/${recipe.slug}`;
}

function totalMinutes(recipe: DiscoveryRecipe) {
  if (!recipe.recipeCookingTime) return null;

  return (
    recipe.recipeCookingTime.prepTime +
    recipe.recipeCookingTime.cookTime +
    recipe.recipeCookingTime.restTime
  );
}

function uniqueRecipes(recipes: DiscoveryRecipe[]) {
  const visibleTitles = new Set<string>();

  return recipes.filter((recipe) => {
    const title = recipe.title.trim().toLowerCase();

    if (visibleTitles.has(title)) return false;
    visibleTitles.add(title);
    return true;
  });
}

export default function HomeCuisineExplorer({
  cuisines,
}: HomeCuisineExplorerProps) {
  const { preference } = useHomePreference();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(
    cuisines.find((cuisine) => cuisine.slug === "north-indian")?.slug ||
      cuisines[0]?.slug ||
      "",
  );
  const availableCuisines = useMemo(
    () =>
      cuisines
        .map((cuisine) => ({
          cuisine,
          recipeCount: uniqueRecipes(cuisine.recipes).filter(
            (recipe) =>
              recipe.RecipeCategories?.name
                .toLowerCase()
                .replaceAll(" ", "-") === preference,
          ).length,
        }))
        .filter(({ recipeCount }) => recipeCount > 0)
        .sort((left, right) => {
          if (left.cuisine.slug === "north-indian") return -1;
          if (right.cuisine.slug === "north-indian") return 1;

          return (
            right.recipeCount - left.recipeCount ||
            left.cuisine.title.localeCompare(right.cuisine.title)
          );
        })
        .map(({ cuisine }) => cuisine),
    [cuisines, preference],
  );
  const selectedCuisine = useMemo(
    () =>
      availableCuisines.find((cuisine) => cuisine.slug === selectedSlug) ||
      availableCuisines[0],
    [availableCuisines, selectedSlug],
  );
  const selectedRecipes = useMemo(
    () =>
      selectedCuisine
        ? uniqueRecipes(selectedCuisine.recipes).filter(
            (recipe) => recipe.RecipeCategories?.name
              .toLowerCase()
              .replaceAll(" ", "-") === preference,
          )
        : [],
    [preference, selectedCuisine],
  );

  function scrollCuisines(direction: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }

  if (!selectedCuisine) return null;

  return (
    <section className="home-surface home-cuisine-explorer py-16 sm:py-20">
      <Container>
        <div className="home-cuisine-panel overflow-hidden rounded-[2rem] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <UtensilsCrossed className="size-4" /> Make home yours
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What is your favourite cuisine?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Pick your taste and this shelf instantly changes with recipes
              inspired by your choice.
            </p>
          </div>

          <div className="relative mt-9">
            <button
              type="button"
              aria-label="Scroll cuisines left"
              onClick={() => scrollCuisines("left")}
              className="home-cuisine-arrow absolute -left-1 top-[38px] z-10 hidden size-11 items-center justify-center rounded-full bg-white text-foreground shadow-md transition hover:text-primary md:flex"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll cuisines right"
              onClick={() => scrollCuisines("right")}
              className="home-cuisine-arrow absolute -right-1 top-[38px] z-10 hidden size-11 items-center justify-center rounded-full bg-white text-foreground shadow-md transition hover:text-primary md:flex"
            >
              <ChevronRight className="size-5" />
            </button>
            <div
              ref={carouselRef}
              className="home-cuisine-slider home-hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-4 md:px-12"
            >
            {availableCuisines.map((cuisine) => {
              const isSelected = cuisine.slug === selectedCuisine.slug;

              return (
                <button
                  type="button"
                  key={cuisine.id}
                  aria-label={`Choose ${cuisine.title}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSlug(cuisine.slug)}
                  className="group flex min-w-[114px] snap-start flex-col items-center gap-3 text-center sm:min-w-[126px]"
                >
                  <span
                    className={`relative block size-[106px] overflow-hidden rounded-full border-[3px] bg-white p-1.5 transition duration-300 sm:size-[116px] ${
                      isSelected
                        ? "border-primary shadow-[0_12px_28px_-12px_rgba(190,55,35,0.65)]"
                        : "border-white/90 shadow-sm group-hover:border-[#dba34f]"
                    }`}
                  >
                    <span className="relative block size-full overflow-hidden rounded-full">
                      <Image
                        src={cuisine.imageUrl || "/meta-images/recipe-page.jpg"}
                        alt=""
                        fill
                        sizes="116px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </span>
                  </span>
                  <span
                    className={`text-xs font-semibold transition sm:text-sm ${
                      isSelected ? "text-primary" : "text-foreground/72"
                    }`}
                  >
                    {cuisine.title}
                  </span>
                </button>
              );
            })}
            </div>
          </div>

          <div className="mt-9 border-t border-[#eddec9] pt-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold sm:text-xl">
                Recipes inspired by {selectedCuisine.title}
              </h3>
              <Link
                href={`/recipes?k=${selectedCuisine.slug}&type=cuisine&food=${preference}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
              >
                Explore {selectedCuisine.title} <ArrowRight className="size-4" />
              </Link>
            </div>

            {selectedRecipes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {selectedRecipes.slice(0, 4).map((recipe) => {
                  const minutes = totalMinutes(recipe);
                  const nutrient = recipe.recipeNutrient[0]?.nutrient.title;

                  return (
                    <Link
                      key={recipe.id}
                      href={recipeHref(recipe)}
                      className="home-cuisine-card group overflow-hidden rounded-[1.4rem] bg-white p-2.5 transition hover:-translate-y-1"
                    >
                      <div className="relative aspect-[1.32] overflow-hidden rounded-[1rem]">
                        <Image
                          src={recipe.imageUrl || "/meta-images/recipe-page.jpg"}
                          alt={recipe.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        {shouldShowRecipeSteam(recipe.title) && (
                          <RecipeSteam className="bottom-[14%] left-1/2" />
                        )}
                        {nutrient && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-[#203628] shadow-sm backdrop-blur">
                            {nutrient}
                          </span>
                        )}
                      </div>
                      <div className="px-2 pb-2 pt-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <FoodPreferenceMarker name={recipe.RecipeCategories?.name || "Veg"} />
                          {minutes !== null && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="size-3.5" /> {minutes} min
                            </span>
                          )}
                        </div>
                        <h4 className="line-clamp-2 text-sm font-semibold leading-6 group-hover:text-primary">
                          {recipe.title}
                        </h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.3rem] border border-dashed border-[#dfcba9] bg-white/55 px-6 py-9 text-center text-sm text-muted-foreground">
                No {preference.replaceAll("-", " ")} recipes are available for{" "}
                {selectedCuisine.title} yet. Try another cuisine or preference.
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
