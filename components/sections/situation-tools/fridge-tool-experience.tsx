"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Refrigerator,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { emptyPagination, recipePageSize } from "@/components/sections/situation-tools/constants";
import { IngredientPicker } from "@/components/sections/situation-tools/controls";
import {
  formatLabel,
  listLabels,
  normalizeValue,
  readableList,
  recipeToSuggestion,
} from "@/components/sections/situation-tools/recipe-formatters";
import {
  RecipeResultCard,
  RecipeResultSkeleton,
} from "@/components/sections/situation-tools/recipe-result-card";
import type {
  IngredientSuggestion,
  InitialRecipePage,
  RecipePagination,
  RecipeSuggestion,
  SituationRecipe,
} from "@/components/sections/situation-tools/types";
import { cn } from "@/lib/utils";

type FridgeToolExperienceProps = {
  initialIngredients: string[];
  initialIngredientLabels: Record<string, string>;
  initialRecipePage?: InitialRecipePage;
};

const foodTypes = [
  { id: "veg", label: "Veg" },
  { id: "non-veg", label: "Non veg" },
  { id: "any", label: "Any" },
];

const quickAdditions = [
  { value: "onion", label: "Onion" },
  { value: "tomato", label: "Tomato" },
  { value: "capsicum", label: "Capsicum" },
  { value: "rice", label: "Rice" },
  { value: "curd", label: "Curd" },
  { value: "potato", label: "Potato" },
];

const ingredientToolPath = "/tools/smart-recipe-finder";

function buildToolUrl(ingredients: string[]) {
  const params = new URLSearchParams();

  if (ingredients.length > 0) params.set("ingredients", ingredients.join(","));

  return `${ingredientToolPath}${params.size ? `?${params}` : ""}`;
}

function areSameIngredients(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  return left.every((item, index) => item === right[index]);
}

function currentUrlIngredients() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("ingredients") ?? "";

  return raw
    .split(",")
    .map(normalizeValue)
    .filter(Boolean);
}

function mapInitialRecipes(
  initialRecipePage: InitialRecipePage | undefined,
  selectedIngredients: string[],
  ingredientLabels: Record<string, string>,
) {
  return (
    initialRecipePage?.recipes
      .map((recipe) =>
        recipeToSuggestion(recipe, {
          activeKey: "ingredients",
          selectedIngredients,
          ingredientLabels,
          mealFocus: "full-day",
          guestCount: 5,
          guestPlan: "full-meal",
          budget: 150,
        }),
      )
      .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe)) ?? []
  );
}

export default function FridgeToolExperience({
  initialIngredients,
  initialIngredientLabels,
  initialRecipePage,
}: FridgeToolExperienceProps) {
  const router = useRouter();
  const [selectedIngredients, setSelectedIngredients] = useState(initialIngredients);
  const [ingredientLabels, setIngredientLabels] = useState(initialIngredientLabels);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState<
    IngredientSuggestion[]
  >([]);
  const [isIngredientSuggestionLoading, setIsIngredientSuggestionLoading] =
    useState(false);
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);
  const [foodType, setFoodType] = useState("veg");
  const [recipePage, setRecipePage] = useState(0);
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>(
    () =>
      mapInitialRecipes(
        initialRecipePage,
        initialIngredients,
        initialIngredientLabels,
      ),
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

  const selectedIngredientText = readableList(
    listLabels(selectedIngredients, ingredientLabels),
    "your ingredients",
  );
  const recipeWord = recipePagination.total === 1 ? "recipe" : "recipes";
  const resultHeading =
    selectedIngredients.length > 0
      ? `You can cook ${recipePagination.total} ${recipeWord} with ${selectedIngredientText}.`
      : "Add ingredients from your kitchen.";
  const totalRecipePages = Math.max(
    Math.ceil(recipePagination.total / recipePagination.pageSize),
    1,
  );
  const pageLabel =
    recipePagination.total > 0
      ? `Page ${recipePagination.page + 1} of ${totalRecipePages}`
      : "Start searching";
  const canGoPrevious = recipePagination.hasPrevious && !isRecipeLoading;
  const canGoNext = recipePagination.hasNext && !isRecipeLoading;

  const shareText = useMemo(
    () =>
      `${resultHeading}\n${recipeSuggestions
        .slice(0, 5)
        .map((item) => `- ${item.title}`)
        .join("\n")}\n\nFind recipes with ingredients at home on Kya Khayen.`,
    [recipeSuggestions, resultHeading],
  );

  const resetRecipePage = () => setRecipePage(0);

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
    resetRecipePage();
  };

  const removeIngredient = (value: string) => {
    setSelectedIngredients((current) => current.filter((item) => item !== value));
    resetRecipePage();
  };

  useEffect(() => {
    const currentIngredients = currentUrlIngredients();

    if (areSameIngredients(currentIngredients, selectedIngredients)) return;

    router.replace(buildToolUrl(selectedIngredients), { scroll: false });
  }, [router, selectedIngredients]);

  useEffect(() => {
    const controller = new AbortController();
    const query = ingredientInput.trim();

    const timeoutId = window.setTimeout(async () => {
      setIsIngredientSuggestionLoading(true);

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("limit", "28");

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
        if (!controller.signal.aborted) setIngredientSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsIngredientSuggestionLoading(false);
      }
    }, query ? 160 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [ingredientInput]);

  useEffect(() => {
    const controller = new AbortController();

    if (selectedIngredients.length === 0) {
      const timeoutId = window.setTimeout(() => {
        setRecipeSuggestions([]);
        setRecipePagination(emptyPagination);
        setRecipeError(false);
        setIsRecipeLoading(false);
      }, 0);

      return () => {
        controller.abort();
        window.clearTimeout(timeoutId);
      };
    }

    const params = new URLSearchParams();
    params.set("mode", "ingredients");
    params.set("pageSize", String(recipePageSize));
    params.set("page", String(recipePage));
    params.set("foodType", foodType);
    selectedIngredients.forEach((ingredient) => {
      params.append("ingredient", ingredient);
    });

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
        const mappedSuggestions = (payload.recipes ?? [])
          .map((recipe) =>
            recipeToSuggestion(recipe, {
              activeKey: "ingredients",
              selectedIngredients,
              ingredientLabels,
              mealFocus: "full-day",
              guestCount: 5,
              guestPlan: "full-meal",
              budget: 150,
            }),
          )
          .filter((recipe): recipe is RecipeSuggestion => Boolean(recipe));

        setRecipeSuggestions(mappedSuggestions);
        setRecipePagination({
          total: payload.total ?? 0,
          page: payload.page ?? recipePage,
          pageSize: payload.pageSize ?? recipePageSize,
          hasNext: Boolean(payload.hasNext),
          hasPrevious: Boolean(payload.hasPrevious),
        });
      } catch {
        if (!controller.signal.aborted) {
          setRecipeSuggestions([]);
          setRecipePagination(emptyPagination);
          setRecipeError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsRecipeLoading(false);
      }
    };

    void fetchRecipes();

    return () => controller.abort();
  }, [foodType, ingredientLabels, recipePage, selectedIngredients]);

  const handleShare = async () => {
    setShareStatus("Sharing");

    try {
      const url = `${window.location.origin}${buildToolUrl(selectedIngredients)}`;

      if (navigator.share) {
        await navigator.share({
          title: "Smart Recipe Finder",
          text: shareText,
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
      }

      setShareStatus("Copied");
      window.setTimeout(() => setShareStatus("Share"), 1400);
    } catch {
      setShareStatus("Share");
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[#ead9c3] bg-[#fffaf1] shadow-[0_28px_80px_-44px_rgba(63,38,21,0.58)] dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-4 border-b border-[#ead9c3] bg-[#fffdf8]/88 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#b63a29] text-white shadow-lg shadow-[#b63a29]/20">
            <Refrigerator className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a17135] dark:text-[#efcb83]">
              Fridge finder
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-[#2f241d] dark:text-white">
              {selectedIngredientText}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
          <div className="rounded-xl border border-[#ead9c3] bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a6b38]">
              Matches
            </p>
            <p className="text-xl font-semibold text-[#2f241d] dark:text-white">
              {recipePagination.total}
            </p>
          </div>
          <div className="rounded-xl border border-[#ead9c3] bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a6b38]">
              Food type
            </p>
            <p className="text-xl font-semibold text-[#2f241d] dark:text-white">
              {foodTypes.find((item) => item.id === foodType)?.label ?? "Veg"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative z-30 min-w-0 border-b border-[#ead9c3] bg-[#fffdf8]/74 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a17135] dark:text-[#efcb83]">
              Ingredient finder
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-tight text-[#2f241d] dark:text-white sm:text-2xl">
              {resultHeading}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#786859] dark:text-white/66">
              Search bottle gourd, potato, rice, lentils, cauliflower, spinach,
              or anything available at home.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-[#ead9c3] bg-white p-3 dark:border-white/10 dark:bg-white/[0.045] sm:p-4">
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
              addValue={addIngredientValue}
              removeValue={removeIngredient}
              placeholder="Search bottle gourd, rice, spinach..."
            />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9b6e37] dark:text-[#efcb83]">
                Food type
              </p>
              <div className="grid grid-cols-3 gap-2">
                {foodTypes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFoodType(item.id);
                      resetRecipePage();
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-sm font-semibold transition",
                      foodType === item.id
                        ? "border-[#b63a29] bg-[#b63a29] text-white shadow-sm"
                        : "border-[#ead9c3] bg-white text-[#5b493d] hover:border-[#cc9448] hover:bg-[#fff7e9] dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#ead9c3] bg-[#fffaf1] p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6730] dark:text-[#efcb83]">
              <Sparkles className="size-3.5" />
              Popular additions
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {quickAdditions.map((item) => {
                const active = selectedIngredients.includes(item.value);

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={active}
                    onClick={() => addIngredientValue(item.value, item.label)}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-semibold transition",
                      active
                        ? "cursor-not-allowed border-[#d8bd9a] bg-[#f3e6d2] text-[#8a735f]"
                        : "border-[#ead9c3] bg-white text-[#5b493d] hover:border-[#cc9448] hover:bg-[#fff7e9] hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-[#f1e4cf] px-3 py-2 text-xs font-semibold text-[#6c513d] dark:bg-white/10 dark:text-white/72">
              {selectedIngredients.length} selected
            </span>
            <span className="rounded-md bg-[#f1e4cf] px-3 py-2 text-xs font-semibold text-[#6c513d] dark:bg-white/10 dark:text-white/72">
              Shareable link
            </span>
            <span className="rounded-md bg-[#f1e4cf] px-3 py-2 text-xs font-semibold text-[#6c513d] dark:bg-white/10 dark:text-white/72">
              Recipe cards
            </span>
          </div>
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a17135] dark:text-[#efcb83]">
                Recipe picks
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#2f241d] dark:text-white">
                Open any recipe and start cooking.
              </h2>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="hidden text-xs font-semibold text-[#7d6a5c] dark:text-white/62 sm:inline">
                {pageLabel}
              </span>
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={() => setRecipePage((current) => Math.max(0, current - 1))}
                className="flex size-10 items-center justify-center rounded-full border border-[#ead9c3] bg-white text-[#8a6d53] transition enabled:hover:border-[#d09b51] enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-42 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"
                aria-label="Previous recipes"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setRecipePage((current) => current + 1)}
                className="flex size-10 items-center justify-center rounded-full border border-[#ead9c3] bg-white text-[#8a6d53] transition enabled:hover:border-[#d09b51] enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-42 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"
                aria-label="Next recipes"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {recipeError ? (
            <div className="rounded-lg border border-[#ead9c3] bg-white px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <p className="font-semibold text-[#2f241d] dark:text-white">
                Recipes could not load right now.
              </p>
              <p className="mt-2 text-sm text-[#806c5d] dark:text-white/64">
                Try again in a moment or search one ingredient at a time.
              </p>
            </div>
          ) : recipeSuggestions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {isRecipeLoading
                ? Array.from({ length: recipePageSize }).map((_, index) => (
                    <RecipeResultSkeleton key={index} />
                  ))
                : recipeSuggestions.map((suggestion) => (
                    <RecipeResultCard key={suggestion.key} suggestion={suggestion} />
                  ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#ead9c3] bg-white px-4 py-10 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <p className="font-semibold text-[#2f241d] dark:text-white">
                Add an ingredient to see recipe ideas.
              </p>
              <p className="mt-2 text-sm text-[#806c5d] dark:text-white/64">
                Try bottle gourd, potato, onion, tomato, rice, lentils, spinach,
                or cauliflower.
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-3 rounded-lg border border-[#ead9c3] bg-[#f5ead8] p-3 dark:border-white/10 dark:bg-white/[0.06] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="min-w-0 text-sm font-semibold leading-6 text-[#4b3a2e] dark:text-white/78">
              Add one main ingredient and one supporting ingredient for tighter matches.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#dfc6a8] bg-white px-4 py-2 text-sm font-semibold text-[#604b3c] transition hover:border-[#d09b51] hover:text-primary dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
              >
                <Share2 className="size-4" /> {shareStatus}
              </button>
              <Link
                href="/recipes"
                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                All recipes
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
