"use client";

import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Heart,
  IndianRupee,
  Minus,
  Plus,
  Refrigerator,
  Search,
  Share2,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import Container from "@/components/container";
import { shouldServeDirectMediaImage } from "@/lib/direct-media-image";
import { cn } from "@/lib/utils";

type SituationKey = "ingredients" | "daily" | "guests" | "budget" | "moms";

type Situation = {
  key: SituationKey;
  title: string;
  shortTitle: string;
  prompt: string;
  icon: LucideIcon;
};

type IngredientSuggestion = {
  id: string;
  label: string;
  value: string;
  recipeCount: number;
};

type SituationRecipe = {
  id: string;
  title: string;
  slug: string;
  metaSlug: string | null;
  imageUrl: string | null;
  matchLabel?: string;
  RecipeCategories: { name: string; slug?: string | null } | null;
  recipeCookingTime: {
    prepTime: number;
    cookTime: number;
    restTime: number;
  } | null;
  recipeNutrient?: Array<{ nutrient: { title: string } }> | null;
  recipeIngredients?: Array<{
    ingredient: { name: string; slug?: string | null };
  }> | null;
  recipeMealTime?: Array<{ mealTime: { title: string; slug: string } }> | null;
  recipeCuisine?: Array<{
    cuisine: { title: string; slug?: string | null };
  }> | null;
  recipeRecipeType?: Array<{
    recipeType: { title: string; slug: string };
  }> | null;
  ingredientCount?: number;
};

type RecipeSuggestion = {
  key: string;
  title: string;
  meta: string;
  tag: string;
  badge: string;
  href: string;
  imageUrl: string;
  context: string;
};

type ResultCopy = {
  heading: string;
  subheading: string;
  highlights: string[];
  quickTip: string;
  emptyTitle: string;
  emptyBody: string;
};

type RecipePagination = {
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type InitialRecipePage = RecipePagination & {
  recipes: SituationRecipe[];
};

const recipePageSize = 6;
const emptyPagination: RecipePagination = {
  total: 0,
  page: 0,
  pageSize: recipePageSize,
  hasNext: false,
  hasPrevious: false,
};

const situations: Situation[] = [
  {
    key: "ingredients",
    title: "Ingredient Finder",
    shortTitle: "Ingredients",
    prompt: "Cook with what you have",
    icon: Refrigerator,
  },
  {
    key: "daily",
    title: "Daily Menu",
    shortTitle: "Daily menu",
    prompt: "Plan today's meals",
    icon: CalendarDays,
  },
  {
    key: "guests",
    title: "Guest Planner",
    shortTitle: "Guests",
    prompt: "Serve without stress",
    icon: UsersRound,
  },
  {
    key: "budget",
    title: "Budget Meals",
    shortTitle: "Budget",
    prompt: "Simple recipe picks",
    icon: IndianRupee,
  },
  {
    key: "moms",
    title: "Moms Mode",
    shortTitle: "Moms mode",
    prompt: "Kids-friendly picks",
    icon: Heart,
  },
];

const mealFocusOptions = [
  { id: "full-day", label: "Any meal" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

const guestPlanOptions = [
  { id: "full-meal", label: "Full meal" },
  { id: "snacks", label: "Snacks" },
  { id: "quick", label: "Quick" },
];

const foodTypeOptions = [
  { id: "veg", label: "Veg" },
  { id: "non-veg", label: "Non veg" },
  { id: "any", label: "Any" },
];

const fridgeHeadlines = ["What's in your fridge?", "Fridge me kya hai?"];
const broadCuisineSlugs = new Set([
  "indian",
  "north-indian",
  "south-indian",
  "international",
  "global",
]);

function recipeHref(recipe: SituationRecipe) {
  return recipe.metaSlug ? `/${recipe.slug}-${recipe.metaSlug}` : `/${recipe.slug}`;
}

function getTotalMinutes(recipe: SituationRecipe) {
  if (!recipe.recipeCookingTime) return null;

  return (
    recipe.recipeCookingTime.prepTime +
    recipe.recipeCookingTime.cookTime +
    recipe.recipeCookingTime.restTime
  );
}

function formatMinutes(minutes: number | null) {
  if (minutes === null || minutes <= 0) return "Recipe";
  return minutes === 1 ? "1 min" : `${minutes} min`;
}

function normalizeValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatLabel(value: string, labels: Record<string, string> = {}) {
  return (
    labels[value] ??
    value
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function listLabels(values: string[], labels: Record<string, string>) {
  return values.map((value) => formatLabel(value, labels));
}

function readableList(items: string[], fallback: string) {
  if (items.length === 0) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function mealFocusLabel(mealFocus: string) {
  return (
    mealFocusOptions.find((option) => option.id === mealFocus)?.label ?? "Any meal"
  );
}

function foodTypeLabel(foodType: string) {
  return foodTypeOptions.find((option) => option.id === foodType)?.label ?? "Veg";
}

function guestPlanLabel(guestPlan: string) {
  return guestPlanOptions.find((option) => option.id === guestPlan)?.label ?? "Full meal";
}

function mealLabel(recipe: SituationRecipe) {
  const preferred = ["lunch", "dinner", "breakfast", "snack", "starter"].find((meal) =>
    [
      ...(recipe.recipeMealTime ?? []).map(
        (item) => `${item.mealTime.title} ${item.mealTime.slug}`,
      ),
      ...(recipe.recipeRecipeType ?? []).map(
        (item) => `${item.recipeType.title} ${item.recipeType.slug}`,
      ),
    ].some((value) => normalizeValue(value).includes(meal)),
  );

  if (preferred === "snack" || preferred === "starter") return "Snacks";
  if (preferred) return formatLabel(preferred);
  return recipe.recipeMealTime?.[0]?.mealTime.title ?? "Any meal";
}

function cuisineLabel(recipe: SituationRecipe) {
  const cuisines = recipe.recipeCuisine?.map((item) => item.cuisine) ?? [];
  const preferred =
    cuisines.find((cuisine) => {
      const slug = cuisine.slug || normalizeValue(cuisine.title).replace(/\s+/g, "-");
      return !broadCuisineSlugs.has(slug);
    }) ?? cuisines[0];

  return preferred?.title ?? null;
}

function recipeToSuggestion(
  recipe: SituationRecipe,
  context: {
    activeKey: SituationKey;
    selectedIngredients: string[];
    ingredientLabels: Record<string, string>;
    mealFocus: string;
    guestCount: number;
    guestPlan: string;
    budget: number;
  },
): RecipeSuggestion | null {
  if (!recipe.imageUrl) return null;

  const ingredientCount =
    recipe.ingredientCount ?? recipe.recipeIngredients?.length ?? null;
  const meal = mealLabel(recipe);
  const type = recipe.recipeRecipeType?.[0]?.recipeType.title ?? "Meal";
  const cuisine = cuisineLabel(recipe);
  const benefit = recipe.recipeNutrient?.[0]?.nutrient.title ?? null;
  let badge = cuisine ?? meal;
  const info =
    benefit ||
    (ingredientCount && ingredientCount > 0
      ? `${ingredientCount} items`
      : type);

  const meta =
    recipe.matchLabel ||
    recipe.recipeMealTime?.[0]?.mealTime.title ||
    recipe.recipeIngredients
      ?.slice(0, 3)
      .map((item) => item.ingredient.name)
      .join(", ") ||
    "Recipe pick";

  if (!cuisine) {
    if (context.activeKey === "ingredients") {
      badge = meal === "Any meal" ? type : meal;
    } else if (context.activeKey === "daily") {
      badge =
        context.mealFocus === "full-day" ? meal : mealFocusLabel(context.mealFocus);
    } else if (context.activeKey === "guests") {
      badge =
        context.guestPlan === "snacks"
          ? "Snacks"
          : context.guestPlan === "quick"
            ? meal === "Any meal"
              ? "Quick"
              : meal
            : meal === "Any meal"
              ? "Guests"
              : meal;
    } else if (context.activeKey === "budget") {
      badge = meal === "Any meal" ? "Budget" : meal;
    } else if (context.activeKey === "moms") {
      badge = meal === "Any meal" ? "Kids" : meal;
    }
  }

  return {
    key: recipe.id,
    title: recipe.title,
    meta,
    tag: formatMinutes(getTotalMinutes(recipe)),
    badge,
    href: recipeHref(recipe),
    imageUrl: recipe.imageUrl,
    context: info,
  };
}

function buildResultCopy({
  activeKey,
  selectedIngredients,
  ingredientLabels,
  mealFocus,
  guestCount,
  guestPlan,
  budget,
  foodType,
}: {
  activeKey: SituationKey;
  selectedIngredients: string[];
  ingredientLabels: Record<string, string>;
  mealFocus: string;
  guestCount: number;
  guestPlan: string;
  budget: number;
  foodType: string;
}): ResultCopy {
  const foodLabel = foodTypeLabel(foodType);

  if (activeKey === "ingredients") {
    const labels = listLabels(selectedIngredients, ingredientLabels);
    const ingredientText = readableList(labels, "your ingredients");

    return {
      heading:
        selectedIngredients.length > 0
          ? `Recipes using ${ingredientText}.`
          : "Search ingredients from your kitchen.",
      subheading: "Add what you have at home and find ideas that fit.",
      highlights: [
        `${selectedIngredients.length} selected`,
        foodLabel,
        "Smart matches",
      ],
      quickTip:
        "Add one main ingredient and one supporting ingredient for tighter matches.",
      emptyTitle:
        selectedIngredients.length > 0
          ? "No matching recipes found."
          : "Add an ingredient to see recipe ideas.",
      emptyBody:
        selectedIngredients.length > 0
          ? "Try a broader ingredient name or add another item from your kitchen."
          : "Search for paneer, rice, roti, dal, potato, onion, or anything available at home.",
    };
  }

  if (activeKey === "daily") {
    const label = mealFocusLabel(mealFocus);

    return {
      heading: `${label} recipe picks.`,
      subheading: "Choose the meal slot and get ideas for the day.",
      highlights: [label, foodLabel, "Fresh ideas"],
      quickTip: "Switch the meal slot when you want a different kind of idea.",
      emptyTitle: "No recipes found for this meal slot.",
      emptyBody: "Try Any meal for more options.",
    };
  }

  if (activeKey === "guests") {
    const plan = guestPlanLabel(guestPlan);

    return {
      heading: `${plan} ideas for ${guestCount} guests.`,
      subheading: "Choose what you are serving, then browse easier options.",
      highlights: [`${guestCount} guests`, plan, foodLabel],
      quickTip:
        "Guest mode now changes by serving style, not just the headcount.",
      emptyTitle: "Guest recipes could not be matched.",
      emptyBody: "Try another serving style once.",
    };
  }

  if (activeKey === "budget") {
    return {
      heading: `Simple recipe picks around Rs ${budget}.`,
      subheading: "Browse simpler ideas with fewer ingredients and shorter cooking time.",
      highlights: [`Rs ${budget}`, foodLabel, "Simple cooking"],
      quickTip: "Budget mode works best when you use it as a simple-cooking filter.",
      emptyTitle: "Budget picks are not available right now.",
      emptyBody: "Try a slightly higher budget.",
    };
  }

  return {
    heading: "Moms mode recipe picks.",
    subheading: "Simple recipes kids can enjoy at home.",
    highlights: [foodLabel, "Kids-friendly", "Family meals"],
    quickTip: "Use the food type filter so the ideas match the family preference.",
    emptyTitle: "Kids-friendly picks are not available right now.",
    emptyBody: "Try Any food type for more options.",
  };
}

function RecipeResultCard({ suggestion }: { suggestion: RecipeSuggestion }) {
  return (
    <Link
      href={suggestion.href}
      className="group flex min-h-[132px] w-full min-w-0 overflow-hidden rounded-lg border border-[#ead9c3] bg-[#fffdf8] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d09b51] hover:shadow-md dark:border-white/10 dark:bg-white/[0.06] sm:min-h-0 sm:flex-col"
    >
      <div className="relative w-[112px] shrink-0 overflow-hidden bg-[#f1e4cf] sm:aspect-[1.38] sm:w-full">
        <Image
          src={suggestion.imageUrl}
          alt={suggestion.title}
          fill
          quality={75}
          unoptimized={shouldServeDirectMediaImage(suggestion.imageUrl)}
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/94 px-2 py-1 text-[10px] font-semibold text-[#8f352a] shadow-sm">
          {suggestion.badge}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#f1e4cf] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#80572c] dark:bg-white/10 dark:text-[#f2cf8b]">
              <Clock3 className="size-3" />
              {suggestion.tag}
            </span>
            <span className="rounded-md bg-[#eef4e9] px-2 py-1 text-[10px] font-semibold text-[#436640] dark:bg-emerald-400/10 dark:text-emerald-100">
              {suggestion.context}
            </span>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#2e241c] transition group-hover:text-primary dark:text-white sm:text-base sm:leading-6">
            {suggestion.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#786859] dark:text-white/64">
            {suggestion.meta}
          </p>
        </div>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          View recipe
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function RecipeResultSkeleton() {
  return (
    <div className="flex min-h-[132px] w-full min-w-0 animate-pulse overflow-hidden rounded-lg border border-[#ead9c3] bg-[#fffdf8] dark:border-white/10 dark:bg-white/[0.06] sm:min-h-0 sm:flex-col">
      <div className="w-[112px] shrink-0 bg-[#f1e4cf] dark:bg-white/10 sm:aspect-[1.38] sm:w-full" />
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <div className="mb-3 h-6 w-28 rounded-md bg-[#f1e4cf] dark:bg-white/10" />
          <div className="h-5 w-3/4 rounded-md bg-[#ead9c3] dark:bg-white/10" />
          <div className="mt-2 h-4 w-full rounded-md bg-[#f5ead8] dark:bg-white/10" />
        </div>
        <div className="mt-3 h-4 w-20 rounded-md bg-[#ead9c3] dark:bg-white/10" />
      </div>
    </div>
  );
}

function ButtonChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-10 rounded-lg border px-3 py-2 text-center text-xs font-semibold transition sm:text-sm",
        active
          ? "border-[#b63a29] bg-[#b63a29] text-white shadow-sm"
          : "border-[#ead9c3] bg-[#fffdf8] text-[#5f4c3d] hover:border-[#c88b3c] hover:text-[#9a3c2e] dark:border-white/10 dark:bg-white/[0.06] dark:text-white/72",
      )}
    >
      {children}
    </button>
  );
}

function ControlBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a6730] dark:text-[#efcb83]">
        {title}
      </p>
      {children}
    </div>
  );
}

function IngredientPicker({
  title,
  input,
  setInput,
  selected,
  labels,
  suggestions,
  isLoading,
  isOpen,
  setOpen,
  placeholder,
  addValue,
  removeValue,
}: {
  title: string;
  input: string;
  setInput: (value: string) => void;
  selected: string[];
  labels: Record<string, string>;
  suggestions: IngredientSuggestion[];
  isLoading: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  placeholder: string;
  addValue: (value: string, label?: string) => void;
  removeValue: (value: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const visibleSuggestions = suggestions.filter(
    (ingredient) => !selected.includes(ingredient.value),
  );
  const hasInput = input.trim().length > 0;
  const showDropdown = isOpen && (isLoading || visibleSuggestions.length > 0 || hasInput);

  const submitValue = () => {
    const first = visibleSuggestions[0];

    if (!hasInput && first) {
      addValue(first.value, first.label);
      setOpen(false);
      return;
    }

    addValue(input);
    setOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [isOpen, setOpen]);

  return (
    <ControlBlock title={title}>
      <div
        ref={pickerRef}
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
      >
        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            submitValue();
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#8c735c]" />
          <input
            value={input}
            onPointerDown={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(event) => {
              setInput(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={placeholder}
            className="h-[46px] w-full rounded-full border border-[#ead6b9] bg-white pl-12 pr-[92px] text-[16px] font-medium text-[#34271f] shadow-[0_12px_32px_-24px_rgba(61,37,20,0.48)] outline-none placeholder:text-[#968577] transition focus:border-[#d9a24b] focus:ring-2 focus:ring-[#d9a24b]/18 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/42 sm:text-sm"
          />
          {input && (
            <button
            type="button"
              onClick={() => {
                setInput("");
                setOpen(true);
              }}
              aria-label="Clear ingredient search"
              className="absolute right-[52px] top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#806c5d] transition hover:bg-[#f2e4d0] dark:text-white/70 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Add item"
            className="absolute right-1.5 top-1/2 inline-flex size-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-[#a92d20]"
          >
            <Plus className="size-4" />
          </button>
        </form>

        {showDropdown && (
          <div
            className="home-hide-scrollbar absolute left-0 right-0 z-50 mt-2 flex max-h-[20rem] flex-col overflow-y-auto overscroll-contain rounded-[1.25rem] border border-[#ead9c2] bg-[#fffdf8] p-2 shadow-[0_24px_62px_-26px_rgba(56,35,19,0.44)] dark:border-white/10 dark:bg-[#14251f]"
          >
            {isLoading ? (
              <div className="px-3.5 py-4 text-sm font-medium text-[#75675b] dark:text-white/62">
                Finding items...
              </div>
            ) : visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((ingredient) => (
                <button
                  type="button"
                  key={ingredient.id}
                  onClick={() => {
                    addValue(ingredient.value, ingredient.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition hover:bg-[#faf1e4] dark:hover:bg-white/8"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#372921] dark:text-white">
                      {ingredient.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#75675b] dark:text-white/60">
                      Tap to add
                    </span>
                  </span>
                  <Plus className="size-4 shrink-0 text-primary" />
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => {
                  addValue(input);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition hover:bg-[#faf1e4] dark:hover:bg-white/8"
              >
                <span>
                  <span className="block text-sm font-semibold text-[#372921] dark:text-white">
                    Search “{input.trim()}”
                  </span>
                  <span className="mt-0.5 block text-xs text-[#806c5d] dark:text-white/60">
                    Match this text against recipe ingredients
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary" />
              </button>
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => removeValue(value)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d8bd9a] bg-[#f3e6d2] px-3 py-1.5 text-sm font-semibold text-[#5a4638] transition hover:border-[#b63a29] hover:text-[#9a3c2e] dark:border-white/10 dark:bg-white/8 dark:text-white/76"
            >
              {formatLabel(value, labels)}
              <X className="size-3.5" />
            </button>
          ))}
        </div>
      )}
    </ControlBlock>
  );
}

function NumberStepper({
  title,
  value,
  setValue,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}) {
  const updateValue = (nextValue: number) => {
    setValue(Math.min(Math.max(nextValue, min), max));
  };

  return (
    <ControlBlock title={title}>
      <div className="flex h-[46px] items-center overflow-hidden rounded-full border border-[#ead6b9] bg-white shadow-[0_12px_32px_-24px_rgba(61,37,20,0.48)] dark:border-white/10 dark:bg-white/[0.06]">
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          aria-label={`Decrease ${title}`}
          className="inline-flex h-full w-12 items-center justify-center text-[#735f50] transition hover:bg-[#f5ead8] dark:text-white/72 dark:hover:bg-white/10"
        >
          <Minus className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 text-center">
          {prefix && (
            <span className="text-sm font-semibold text-[#806c5d] dark:text-white/62">
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => updateValue(Number(event.target.value) || min)}
            className="h-full w-20 bg-transparent text-center text-base font-semibold text-[#34271f] outline-none dark:text-white"
          />
          {suffix && (
            <span className="text-sm font-semibold text-[#806c5d] dark:text-white/62">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => updateValue(value + step)}
          aria-label={`Increase ${title}`}
          className="inline-flex h-full w-12 items-center justify-center text-[#735f50] transition hover:bg-[#f5ead8] dark:text-white/72 dark:hover:bg-white/10"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </ControlBlock>
  );
}

export default function HomeSituationTools({
  initialRecipePage,
}: {
  initialRecipePage?: InitialRecipePage;
}) {
  const initialSuggestionContext = {
    activeKey: "ingredients" as SituationKey,
    selectedIngredients: ["paneer"],
    ingredientLabels: { paneer: "Paneer" },
    mealFocus: "full-day",
    guestCount: 5,
    guestPlan: "full-meal",
    budget: 150,
  };
  const [activeKey, setActiveKey] = useState<SituationKey>("ingredients");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(["paneer"]);
  const [ingredientLabels, setIngredientLabels] = useState<Record<string, string>>({
    paneer: "Paneer",
  });
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState<
    IngredientSuggestion[]
  >([]);
  const [isIngredientSuggestionLoading, setIsIngredientSuggestionLoading] =
    useState(false);
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);
  const [mealFocus, setMealFocus] = useState("full-day");
  const [guestCount, setGuestCount] = useState(5);
  const [guestPlan, setGuestPlan] = useState("full-meal");
  const [budget, setBudget] = useState(150);
  const [foodType, setFoodType] = useState("veg");
  const [recipePage, setRecipePage] = useState(0);
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>(
    () =>
      initialRecipePage?.recipes
        .map((recipe) => recipeToSuggestion(recipe, initialSuggestionContext))
        .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe)) ?? [],
  );
  const [recipePagination, setRecipePagination] = useState<RecipePagination>(
    () =>
      initialRecipePage
        ? {
            total: initialRecipePage.total,
            page: initialRecipePage.page,
            pageSize: initialRecipePage.pageSize,
            hasNext: initialRecipePage.hasNext,
            hasPrevious: initialRecipePage.hasPrevious,
          }
        : emptyPagination,
  );
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share");
  const [headlineIndex, setHeadlineIndex] = useState(0);

  const activeSituation =
    situations.find((situation) => situation.key === activeKey) ?? situations[0];
  const result = useMemo(
    () =>
      buildResultCopy({
        activeKey,
        selectedIngredients,
        ingredientLabels,
        mealFocus,
        guestCount,
        guestPlan,
        budget,
        foodType,
      }),
    [
      activeKey,
      selectedIngredients,
      ingredientLabels,
      mealFocus,
      guestCount,
      guestPlan,
      budget,
      foodType,
    ],
  );

  const shareText = `${result.heading}\n${recipeSuggestions
    .slice(0, 5)
    .map((item) => `- ${item.title}`)
    .join("\n")}\n\nFind more meal ideas on KyaKhayen.`;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeadlineIndex((current) => (current + 1) % fridgeHeadlines.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  const addIngredientValue = (value: string, label?: string) => {
    const normalized = normalizeValue(value);

    if (!normalized) return;

    setSelectedIngredients((current) =>
      current.includes(normalized) ? current : [...current, normalized],
    );
    setIngredientLabels((current) => ({
      ...current,
      [normalized]: label || formatLabel(normalized, current),
    }));
    setIngredientInput("");
    setRecipePage(0);
  };

  const removeIngredient = (value: string) => {
    setSelectedIngredients((current) => current.filter((item) => item !== value));
    setRecipePage(0);
  };

  useEffect(() => {
    const controller = new AbortController();
    const query = ingredientInput.trim();

    const timeoutId = window.setTimeout(async () => {
      setIsIngredientSuggestionLoading(true);

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("limit", "24");

        const response = await fetch(`/api/ingredients/suggestions?${params}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load ingredients");

        const payload = (await response.json()) as {
          suggestions?: IngredientSuggestion[];
        };

        setIngredientSuggestions(payload.suggestions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setIngredientSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsIngredientSuggestionLoading(false);
        }
      }
    }, query ? 160 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [ingredientInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    params.set("mode", activeKey);
    params.set("pageSize", String(recipePageSize));
    params.set("page", String(recipePage));
    params.set("foodType", foodType);

    if (activeKey === "ingredients") {
      if (selectedIngredients.length === 0) {
        const timeoutId = window.setTimeout(() => {
          setRecipeSuggestions([]);
          setRecipePagination(emptyPagination);
          setIsRecipeLoading(false);
          setRecipeError(false);
        }, 0);

        return () => {
          controller.abort();
          window.clearTimeout(timeoutId);
        };
      }

      selectedIngredients.forEach((ingredient) => {
        params.append("ingredient", ingredient);
      });
    }

    if (activeKey === "daily") params.set("mealFocus", mealFocus);
    if (activeKey === "guests") {
      params.set("guestCount", String(guestCount));
      params.set("guestPlan", guestPlan);
    }
    if (activeKey === "budget") params.set("budget", String(budget));

    const fetchRecipes = async () => {
      setIsRecipeLoading(true);
      setRecipeError(false);

      try {
        const response = await fetch(`/api/recipes/situation-matches?${params}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load recipes");

        const payload = (await response.json()) as {
          recipes?: SituationRecipe[];
          total?: number;
          page?: number;
          pageSize?: number;
          hasNext?: boolean;
          hasPrevious?: boolean;
        };

        const suggestionContext = {
          activeKey,
          selectedIngredients,
          ingredientLabels,
          mealFocus,
          guestCount,
          guestPlan,
          budget,
        };

        const mappedSuggestions = (payload.recipes ?? [])
            .map((recipe) => recipeToSuggestion(recipe, suggestionContext))
            .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe));
        const shouldKeepInitialPaneer =
          activeKey === "ingredients" &&
          recipePage === 0 &&
          foodType === "veg" &&
          selectedIngredients.length === 1 &&
          selectedIngredients[0] === "paneer" &&
          mappedSuggestions.length === 0 &&
          (initialRecipePage?.recipes.length ?? 0) > 0;

        if (!shouldKeepInitialPaneer) {
          setRecipeSuggestions(mappedSuggestions);
        }
        setRecipePagination(
          shouldKeepInitialPaneer && initialRecipePage
            ? {
                total: initialRecipePage.total,
                page: initialRecipePage.page,
                pageSize: initialRecipePage.pageSize,
                hasNext: initialRecipePage.hasNext,
                hasPrevious: initialRecipePage.hasPrevious,
              }
            : {
                total: payload.total ?? 0,
                page: payload.page ?? recipePage,
                pageSize: payload.pageSize ?? recipePageSize,
                hasNext: Boolean(payload.hasNext),
                hasPrevious: Boolean(payload.hasPrevious),
              },
        );
      } catch {
        if (!controller.signal.aborted) {
          setRecipeSuggestions([]);
          setRecipePagination(emptyPagination);
          setRecipeError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRecipeLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void fetchRecipes();
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    activeKey,
    budget,
    foodType,
    guestCount,
    guestPlan,
    ingredientLabels,
    initialRecipePage,
    mealFocus,
    recipePage,
    selectedIngredients,
  ]);

  const handleShare = async () => {
    setShareStatus("Sharing");

    try {
      if (navigator.share) {
        await navigator.share({
          title: result.heading,
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
      }

      setShareStatus("Copied");
      window.setTimeout(() => setShareStatus("Share"), 1400);
    } catch {
      setShareStatus("Share");
    }
  };

  const totalRecipePages = Math.max(
    Math.ceil(recipePagination.total / recipePagination.pageSize),
    1,
  );
  const pageLabel =
    recipePagination.total > 0
      ? `Page ${recipePagination.page + 1} of ${totalRecipePages}`
      : "Add items";
  const canGoPrevious = recipePagination.hasPrevious && !isRecipeLoading;
  const canGoNext = recipePagination.hasNext && !isRecipeLoading;
  const recipeWord = recipePagination.total === 1 ? "recipe" : "recipes";
  const selectedIngredientText = readableList(
    listLabels(selectedIngredients, ingredientLabels),
    "these ingredients",
  );
  const recipeCountCopy =
    !isRecipeLoading && recipePagination.total > 0
      ? activeKey === "ingredients"
        ? `You can cook ${recipePagination.total} ${recipeWord} with ${selectedIngredientText}.`
        : activeKey === "daily"
          ? `${recipePagination.total} ${mealFocusLabel(mealFocus).toLowerCase()} ideas matched.`
          : activeKey === "guests"
            ? `${recipePagination.total} ${guestPlanLabel(guestPlan).toLowerCase()} ideas matched for ${guestCount} guests.`
            : activeKey === "budget"
              ? `${recipePagination.total} simple ideas matched around Rs ${budget}.`
              : `${recipePagination.total} kids-friendly ideas matched.`
      : null;

  return (
    <section className="home-surface home-situation-engine relative z-20 border-y border-[#eadbc8]/72 py-8 sm:py-12 lg:py-16">
      <Container>
        <div className="mb-5 max-w-3xl sm:mb-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Search className="size-4" /> Kitchen assistant
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#2e241c] dark:text-white sm:text-4xl">
            {fridgeHeadlines[headlineIndex]}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Pick a real kitchen situation, add what you have, and find recipes
            faster.
          </p>
        </div>

        <div className="home-situation-panel overflow-visible rounded-[1.2rem] border border-[#ead9c3] bg-[#fffaf1] shadow-xl shadow-[#5c3219]/10 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="border-b border-[#ead9c3] bg-[#fffdf8]/88 p-3 dark:border-white/10 dark:bg-white/[0.035] sm:p-4">
            <div className="home-hide-scrollbar flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
              {situations.map((situation) => {
                const Icon = situation.icon;
                const active = situation.key === activeKey;

                return (
                  <button
                    key={situation.key}
                    type="button"
                    onClick={() => {
                      setActiveKey(situation.key);
                      setRecipePage(0);
                      setShareStatus("Share");
                    }}
                    aria-pressed={active}
                    className={cn(
                      "min-w-[10.5rem] rounded-lg border px-3 py-3 text-left transition sm:min-w-0",
                      active
                        ? "border-[#b63a29] bg-[#b63a29] text-white shadow-sm"
                        : "border-[#ead9c3] bg-white text-[#342820] hover:border-[#cc9448] hover:bg-[#fff7e9] dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          active
                            ? "bg-white/16 text-white"
                            : "bg-[#f1e3cf] text-[#9a3c2e] dark:bg-white/10 dark:text-[#efcb83]",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {situation.shortTitle}
                        </span>
                        <span
                          className={cn(
                            "home-situation-tab-copy mt-0.5 block overflow-hidden whitespace-nowrap text-[11px]",
                            active
                              ? "text-white/76"
                              : "text-[#7d6b5c] dark:text-white/62",
                          )}
                        >
                          <span className="home-situation-tab-copy-text">
                            {situation.prompt}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-w-0 gap-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative z-30 min-w-0 border-b border-[#ead9c3] bg-[#fffdf8]/64 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a17135] dark:text-[#efcb83]">
                  {activeSituation.title}
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-[#2f241d] dark:text-white sm:text-2xl">
                  {result.heading}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#786859] dark:text-white/66">
                  {result.subheading}
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-[#ead9c3] bg-white p-3 dark:border-white/10 dark:bg-white/[0.045] sm:p-4">
                {activeKey === "ingredients" && (
                  <IngredientPicker
                    title="Ingredients at home"
                    input={ingredientInput}
                    setInput={setIngredientInput}
                    selected={selectedIngredients}
                    labels={ingredientLabels}
                    suggestions={ingredientSuggestions}
                    isLoading={isIngredientSuggestionLoading}
                    isOpen={isIngredientPickerOpen}
                    setOpen={setIsIngredientPickerOpen}
                    placeholder="Search paneer, rice, palak..."
                    addValue={addIngredientValue}
                    removeValue={removeIngredient}
                  />
                )}

                {activeKey === "daily" && (
                  <ControlBlock title="Meal focus">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {mealFocusOptions.map((option) => (
                        <ButtonChip
                          key={option.id}
                          active={mealFocus === option.id}
                          onClick={() => {
                            setMealFocus(option.id);
                            setRecipePage(0);
                          }}
                        >
                          {option.label}
                        </ButtonChip>
                      ))}
                    </div>
                  </ControlBlock>
                )}

                {activeKey === "guests" && (
                  <>
                    <NumberStepper
                      title="Guest count"
                      value={guestCount}
                      setValue={(value) => {
                        setGuestCount(value);
                        setRecipePage(0);
                      }}
                      min={1}
                      max={50}
                      step={1}
                      suffix="guests"
                    />
                    <ControlBlock title="Serving style">
                      <div className="grid grid-cols-3 gap-2">
                        {guestPlanOptions.map((option) => (
                          <ButtonChip
                            key={option.id}
                            active={guestPlan === option.id}
                            onClick={() => {
                              setGuestPlan(option.id);
                              setRecipePage(0);
                            }}
                          >
                            {option.label}
                          </ButtonChip>
                        ))}
                      </div>
                    </ControlBlock>
                  </>
                )}

                {activeKey === "budget" && (
                  <NumberStepper
                    title="Budget mode"
                    value={budget}
                    setValue={(value) => {
                      setBudget(value);
                      setRecipePage(0);
                    }}
                    min={50}
                    max={2000}
                    step={25}
                    prefix="Rs"
                  />
                )}

                {activeKey === "moms" && (
                  <ControlBlock title="Kids focus">
                    <div className="rounded-lg border border-[#ead9c3] bg-[#fffaf1] px-3 py-3 text-sm font-semibold leading-6 text-[#47352a] dark:border-white/10 dark:bg-white/[0.055] dark:text-white/72">
                      Simple family recipes that usually work well for kids.
                    </div>
                  </ControlBlock>
                )}

                <ControlBlock title="Food type">
                  <div className="grid grid-cols-3 gap-2">
                    {foodTypeOptions.map((option) => (
                      <ButtonChip
                        key={option.id}
                        active={foodType === option.id}
                        onClick={() => {
                          setFoodType(option.id);
                          setRecipePage(0);
                        }}
                      >
                        {option.label}
                      </ButtonChip>
                    ))}
                  </div>
                </ControlBlock>
              </div>

              {recipeCountCopy && (
                <div className="mt-4 rounded-lg border border-[#ead9c3] bg-[#fff4df] px-3 py-3 text-sm font-semibold leading-6 text-[#49362a] dark:border-white/10 dark:bg-white/[0.055] dark:text-white/76">
                  {recipeCountCopy}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {result.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-md border border-[#ead9c3] bg-[#f4e7d3] px-3 py-2 text-xs font-semibold text-[#624b37] dark:border-white/10 dark:bg-white/8 dark:text-white/72"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 min-w-0 bg-[linear-gradient(145deg,#fff9ef,#fffdf8)] p-4 dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] sm:p-5 lg:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a17135] dark:text-[#efcb83]">
                    Recipe picks
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#33271f] dark:text-white">
                    {recipeCountCopy ?? "Open any recipe and start cooking."}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold text-[#806c5d] dark:text-white/62">
                    {pageLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecipePage((page) => Math.max(page - 1, 0))}
                    disabled={!canGoPrevious}
                    aria-label="Previous recipes"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-[#dfc7a8] bg-white text-[#614638] transition hover:border-[#bd7e35] hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/12 dark:bg-white/8 dark:text-white"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipePage((page) => page + 1)}
                    disabled={!canGoNext}
                    aria-label="Next recipes"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-[#dfc7a8] bg-white text-[#614638] transition hover:border-[#bd7e35] hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/12 dark:bg-white/8 dark:text-white"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {isRecipeLoading ? (
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <RecipeResultSkeleton key={index} />
                  ))}
                </div>
              ) : recipeSuggestions.length > 0 ? (
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recipeSuggestions.map((suggestion) => (
                    <RecipeResultCard
                      key={`${activeKey}-${suggestion.key}`}
                      suggestion={suggestion}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-[#ead9c3] bg-[#fffdf8] p-6 text-center dark:border-white/10 dark:bg-white/[0.055]">
                  <p className="text-sm font-semibold text-[#33271f] dark:text-white">
                    {recipeError
                      ? "Recipes could not be loaded right now."
                      : result.emptyTitle}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#806c5d] dark:text-white/60">
                    {recipeError
                      ? "Please try again in a moment."
                      : result.emptyBody}
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-3 rounded-lg border border-[#ead9c3] bg-[#f5ead8] p-3 dark:border-white/10 dark:bg-white/[0.055] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-4">
                <p className="text-sm font-semibold leading-6 text-[#35281f] dark:text-white">
                  {result.quickTip}
                </p>
                {recipeSuggestions[0] && (
                  <Link
                    href={recipeSuggestions[0].href}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-websecondary-400"
                  >
                    Explore <ArrowRight className="size-4" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#d8bd9a] bg-white px-4 py-2 text-sm font-semibold text-[#594335] transition hover:border-[#bd7e35] hover:text-primary dark:border-white/12 dark:bg-white/8 dark:text-white"
                >
                  {shareStatus === "Copied" ? (
                    <Copy className="size-4" />
                  ) : (
                    <Share2 className="size-4" />
                  )}
                  {shareStatus}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
