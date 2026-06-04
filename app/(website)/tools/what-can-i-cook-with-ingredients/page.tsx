import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import {
  ArrowRight,
  CookingPot,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import Container from "@/components/container";
import FridgeToolExperience from "@/components/sections/situation-tools/fridge-tool-experience";
import type {
  InitialRecipePage,
  SituationRecipe,
} from "@/components/sections/situation-tools/types";
import { db } from "@/lib/db";
import { publishedRecipeAnd } from "@/lib/recipe-publication";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildSeoMetadata,
  itemListJsonLd,
  jsonLd,
  recipeHref,
} from "@/lib/seo";

type ToolSearchParams = Promise<{
  ingredients?: string | string[];
  ingredient?: string | string[];
}>;

const pagePath = "/tools/what-can-i-cook-with-ingredients";
const pageTitle = "What Can I Cook With Ingredients I Have?";
const pageDescription =
  "Use this recipe finder by ingredients to search what you can cook with ingredients at home. Add bottle gourd, potato, onion, rice, lentils, spinach, cauliflower, curd, or leftovers and open matching Indian recipes.";
const pageSize = 6;

const popularIngredientLinks = [
  {
    label: "Bottle gourd for dinner",
    eyebrow: "Use it first",
    ingredients: ["bottle gourd"],
    body: "Turn a quiet fridge vegetable into dinner ideas. Add lentils, tomato, onion, or curd inside the finder.",
  },
  {
    label: "Potato + onion ideas",
    eyebrow: "Everyday veg",
    ingredients: ["potato", "onion"],
    body: "A practical search when the kitchen has only the basics and dinner still needs a plan.",
  },
  {
    label: "Onion + tomato base",
    eyebrow: "Gravy starter",
    ingredients: ["onion", "tomato"],
    body: "A practical starting point for quick Indian gravies and vegetable dishes.",
  },
  {
    label: "Leftover rice ideas",
    eyebrow: "Leftover rescue",
    ingredients: ["rice"],
    body: "Use cooked rice for fast lunch, dinner, and one-pot recipe ideas.",
  },
  {
    label: "Lentils need a plan",
    eyebrow: "Simple meal",
    ingredients: ["dal"],
    body: "Find lentil-based ideas that can become lunch, dinner, or a simple family meal.",
  },
  {
    label: "Cauliflower dinner",
    eyebrow: "Seasonal veg",
    ingredients: ["cauliflower"],
    body: "Open cauliflower ideas and add potato, peas, onion, or tomato inside the tool.",
  },
  {
    label: "Spinach in the fridge",
    eyebrow: "Greens",
    ingredients: ["spinach"],
    body: "Find spinach ideas and combine with corn, dal, potato, onion, or tomato.",
  },
  {
    label: "Curd needs finishing",
    eyebrow: "Use it today",
    ingredients: ["curd"],
    body: "Useful when curd is open and you want lunch, dinner, side dish, or rice ideas.",
  },
];

const faqs = [
  {
    question: "How does the fridge recipe finder work?",
    answer:
      "Search the ingredient you already have, such as bottle gourd, potato, onion, tomato, rice, lentils, spinach, cauliflower, or curd. The tool opens matching Indian recipe cards with images, cooking time, cuisine, and the useful detail shown on each card.",
  },
  {
    question: "Can I search with more than one ingredient?",
    answer:
      "Yes. Start with one main ingredient like bottle gourd, potato, rice, lentils, or cauliflower, then add supporting ingredients like onion, tomato, capsicum, curd, peas, or spinach. More relevant ingredients make the recipe matches tighter.",
  },
  {
    question: "What should I search when I do not know what to cook?",
    answer:
      "Use the ingredient sitting in your kitchen first. For example, search bottle gourd if it needs to be used, potato onion if only basics are available, onion tomato if you want a curry base, or rice if you have leftover rice.",
  },
  {
    question: "Are the results vegetarian by default?",
    answer:
      "Yes. The tool starts with vegetarian recipe ideas by default. You can switch food type inside the tool if you want non veg or broader recipe ideas.",
  },
  {
    question: "Can I use this for leftover ingredients?",
    answer:
      "Yes. Add leftover rice, cooked lentils, curd, vegetables, or any item that needs to be used first. The matching cards help you choose what can be cooked today.",
  },
];

const howToSteps = [
  {
    icon: Search,
    title: "Search what is actually in your kitchen",
    body: "Type a real ingredient instead of a recipe name. Search bottle gourd, cauliflower, leftover rice, curd, lentils, onion, tomato, capsicum, potato, or spinach.",
  },
  {
    icon: Sparkles,
    title: "Add one supporting item for better matches",
    body: "If bottle gourd is available, add lentils or tomato. If rice is left, add curd or vegetables. The tool becomes more useful when it knows the base and the support.",
  },
  {
    icon: CookingPot,
    title: "Open a recipe that can be cooked today",
    body: "Recipe cards show image, time, cuisine, and useful food detail so you can quickly decide whether it works for lunch, dinner, snacks, or family cooking.",
  },
  {
    icon: Share2,
    title: "Share the same kitchen search",
    body: "Send the result page to someone at home when the question is still the same: what is available, and what can we cook today?",
  },
];

const searchExamples = [
  "what to cook with bottle gourd",
  "potato onion tomato dinner",
  "leftover rice lunch ideas",
  "spinach recipes for dinner",
  "cauliflower curry ideas",
  "curd and rice recipes",
];

const fridgeRecipeSelect = {
  id: true,
  title: true,
  slug: true,
  metaSlug: true,
  imageUrl: true,
  views: true,
  RecipeCategories: { select: { name: true, slug: true } },
  recipeCookingTime: {
    select: { prepTime: true, cookTime: true, restTime: true },
  },
  recipeNutrient: {
    where: { nutrient: { isPublished: true } },
    select: { nutrient: { select: { title: true } } },
    take: 1,
  },
  recipeIngredients: {
    select: { ingredient: { select: { name: true, slug: true } } },
    take: 32,
  },
  recipeMealTime: {
    where: { mealTime: { isPublished: true } },
    select: { mealTime: { select: { title: true, slug: true } } },
    take: 4,
  },
  recipeCuisine: {
    where: { cuisine: { isPublished: true } },
    select: { cuisine: { select: { title: true, slug: true } } },
    take: 3,
  },
  recipeRecipeType: {
    where: { recipeType: { isPublished: true } },
    select: { recipeType: { select: { title: true, slug: true } } },
    take: 4,
  },
  _count: { select: { recipeIngredients: true } },
} satisfies Prisma.RecipesSelect;

type FridgeRecipeRecord = Prisma.RecipesGetPayload<{
  select: typeof fridgeRecipeSelect;
}>;

export const revalidate = 900;

export const metadata: Metadata = buildSeoMetadata({
  title: `${pageTitle} | Kya Khayen`,
  description: pageDescription,
  path: pagePath,
  image: "/meta-images/home.png",
  imageAlt: "What can I cook with ingredients at home recipe finder",
  keywords: [
    "what can I cook with ingredients",
    "what can I cook with ingredients I have",
    "what can I make with ingredients I have",
    "recipe finder by ingredients",
    "recipes by ingredients",
    "find recipes by ingredients",
    "cook with what you have",
    "what is in my fridge recipe finder",
    "recipes with ingredients at home",
    "what to cook with ingredients at home",
    "Indian recipe finder by ingredients",
    "what to cook with bottle gourd",
    "leftover rice recipe ideas",
    "vegetarian recipes by ingredients",
  ],
});

function normalizeToolValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugValue(value: string) {
  return normalizeToolValue(value).replace(/\s+/g, "-");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseIngredients(params: Awaited<ToolSearchParams>) {
  const rawValues = [
    singleParam(params.ingredients),
    ...(Array.isArray(params.ingredient)
      ? params.ingredient
      : params.ingredient
        ? [params.ingredient]
        : []),
  ];
  const values = rawValues
    .flatMap((value) => value.split(","))
    .map(normalizeToolValue)
    .filter(Boolean);
  const uniqueValues = Array.from(new Set(values)).slice(0, 8);

  return uniqueValues.length > 0 ? uniqueValues : ["bottle gourd"];
}

function ingredientWhere(value: string): Prisma.RecipesWhereInput[] {
  const normalized = normalizeToolValue(value);
  const slug = slugValue(value);

  return [
    { title: { contains: normalized } },
    { slug: { contains: slug } },
    {
      recipeIngredients: {
        some: {
          ingredient: {
            OR: [
              { name: { contains: normalized } },
              { slug: { contains: slug } },
            ],
          },
        },
      },
    },
  ];
}

function recipeText(recipe: FridgeRecipeRecord) {
  return normalizeToolValue(
    [
      recipe.title,
      recipe.slug,
      recipe.RecipeCategories?.name,
      ...recipe.recipeMealTime.map((item) => item.mealTime.title),
      ...recipe.recipeMealTime.map((item) => item.mealTime.slug),
      ...recipe.recipeRecipeType.map((item) => item.recipeType.title),
      ...recipe.recipeRecipeType.map((item) => item.recipeType.slug),
      ...recipe.recipeIngredients.map((item) => item.ingredient.name),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function scoreRecipe(recipe: FridgeRecipeRecord, ingredients: string[]) {
  const text = recipeText(recipe);
  const title = normalizeToolValue(recipe.title);
  let score = Math.log10(Math.max(recipe.views, 0) + 10) * 80;

  ingredients.forEach((ingredient, index) => {
    const weight = index === 0 ? 280 : 130;
    if (title.includes(ingredient)) score += weight;
    if (text.includes(ingredient)) score += Math.round(weight * 0.66);
  });

  if (/\b(lunch|dinner|meal|sabzi|curry|dal|gravy|masala|bhurji)\b/.test(text)) {
    score += 220;
  }
  if (/\b(snack|momo|momos|drink|water|juice|smoothie|dessert|salad|soup)\b/.test(text)) {
    score -= 180;
  }

  return score;
}

function publicRecipe(recipe: FridgeRecipeRecord, ingredients: string[]): SituationRecipe {
  const matched = ingredients
    .filter((ingredient) => recipeText(recipe).includes(ingredient))
    .slice(0, 2)
    .map(titleCase);

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    metaSlug: recipe.metaSlug,
    imageUrl: recipe.imageUrl,
    RecipeCategories: recipe.RecipeCategories,
    recipeCookingTime: recipe.recipeCookingTime,
    recipeNutrient: recipe.recipeNutrient,
    recipeIngredients: recipe.recipeIngredients,
    recipeMealTime: recipe.recipeMealTime,
    recipeCuisine: recipe.recipeCuisine,
    recipeRecipeType: recipe.recipeRecipeType,
    ingredientCount: recipe._count.recipeIngredients,
    matchLabel:
      matched.length > 0 ? `Matches ${matched.join(", ")}` : "Recipe idea",
  };
}

async function getInitialRecipePage(
  ingredients: string[],
): Promise<InitialRecipePage> {
  const recipes = await db.recipes.findMany({
    where: publishedRecipeAnd([
      { imageUrl: { not: null } },
      {
        RecipeCategories: {
          OR: [{ slug: { in: ["veg", "vegan"] } }, { name: { in: ["Veg", "Vegan"] } }],
        },
      },
      { OR: ingredients.flatMap(ingredientWhere) },
    ]),
    select: fridgeRecipeSelect,
    orderBy: [
      { views: "desc" },
      { contentUpdatedAt: "desc" },
      { updatedAt: "desc" },
    ],
  });
  const ranked = recipes
    .sort((left, right) => scoreRecipe(right, ingredients) - scoreRecipe(left, ingredients));

  return {
    recipes: ranked.slice(0, pageSize).map((recipe) => publicRecipe(recipe, ingredients)),
    total: ranked.length,
    page: 0,
    pageSize,
    hasPrevious: false,
    hasNext: ranked.length > pageSize,
  };
}

function toolUrl(ingredients: string[], scrollToTool = true) {
  const params = new URLSearchParams({ ingredients: ingredients.join(",") });
  return `${pagePath}?${params}${scrollToTool ? "#fridge-tool" : ""}`;
}

function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "What Can I Cook With Ingredients Recipe Finder",
    url: absoluteUrl(pagePath),
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description: pageDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function FridgeHeroScene() {
  return (
    <div
      className="relative min-h-[34rem] overflow-hidden bg-[#fff2d8] px-4 py-6 text-[#2e241c] sm:px-7 lg:min-h-full"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(203,127,54,0.22),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(76,122,84,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,230,194,0.62))]" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-[#d9b681]/38" />
      <div className="absolute left-8 top-8 h-16 w-28 rounded-full bg-[#7b9c62]/18 blur-2xl" />
      <div className="absolute right-8 top-12 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />

      <div className="fridge-scene relative mx-auto h-[32rem] max-w-[43rem]">
        <div className="absolute left-2 top-6 h-24 w-44 rounded-[1.6rem] border border-[#e7cfae] bg-white/40 shadow-inner" />
        <div className="absolute left-8 top-12 h-3 w-28 rounded-full bg-[#d8b47e]/70" />
        <div className="absolute left-8 top-20 h-3 w-20 rounded-full bg-[#d8b47e]/55" />

        <div className="absolute bottom-5 right-2 h-[29rem] w-[20rem] rounded-[1.8rem] border-[0.55rem] border-white bg-[#edf3f1] shadow-[0_34px_84px_-34px_rgba(40,28,20,0.92)]">
          <div className="absolute -left-1 top-[7.4rem] h-1 w-[calc(100%+0.5rem)] bg-white/95 shadow-sm" />
          <div className="absolute left-4 top-4 h-8 w-24 rounded-xl bg-white/64 shadow-inner" />
          <div className="absolute inset-x-4 bottom-4 top-[9rem] rounded-[1.15rem] bg-[#eaf8f4] shadow-inner" />
          <div className="fridge-glow absolute inset-x-5 bottom-5 top-[9.3rem] rounded-[1rem] bg-[#eefdf7]" />
          <div className="absolute left-3 top-[8.8rem] h-24 w-1 rounded-full bg-[#d5c1a4]" />

          <div className="absolute left-8 right-8 top-[12.8rem] h-0.5 rounded-full bg-[#c7d9d3]" />
          <div className="absolute left-8 right-8 top-[18.4rem] h-0.5 rounded-full bg-[#c7d9d3]" />
          <div className="absolute left-8 right-8 top-[23.4rem] h-0.5 rounded-full bg-[#c7d9d3]" />

          <div className="absolute left-9 top-[10.3rem] h-12 w-20 rounded-full border border-[#bfd5c8] bg-[#dff1dc] shadow-sm">
            <span className="absolute left-3 top-3 h-5 w-5 rounded-full bg-[#5a9d48]" />
            <span className="absolute left-8 top-2 h-7 w-7 rounded-full bg-[#77b15e]" />
            <span className="absolute right-3 top-4 h-5 w-5 rounded-full bg-[#4c8f41]" />
          </div>
          <div className="absolute right-10 top-[10.2rem] h-12 w-16 rounded-full bg-[#f5ead6]">
            <span className="absolute left-4 top-2 h-9 w-9 rounded-full bg-[#efe1b4]" />
            <span className="absolute left-8 top-3 h-8 w-8 rounded-full bg-[#f8f1cb]" />
            <span className="absolute left-2 top-5 h-7 w-7 rounded-full bg-[#dfcd8f]" />
          </div>

          <div className="absolute left-9 top-[15rem] h-10 w-32 rounded-full bg-[#a9be50]" />
          <div className="absolute right-9 top-[15.5rem] flex gap-1.5">
            <span className="size-6 rounded-full bg-[#c9352d]" />
            <span className="size-6 rounded-full bg-[#dd4b38]" />
            <span className="size-6 rounded-full bg-[#b52b25]" />
          </div>

          <div className="absolute left-10 top-[20rem] h-12 w-20 rounded-b-full rounded-t-[0.75rem] border border-[#cee1dc] bg-white">
            <span className="absolute inset-x-3 top-4 h-4 rounded-full bg-[#eef3ed]" />
          </div>
          <div className="absolute right-9 top-[19.8rem] flex h-14 w-20 flex-wrap gap-1.5 rounded-2xl bg-[#d7b36b]/24 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <span
                key={index}
                className="size-5 rounded-full bg-[#c99b55]"
              />
            ))}
          </div>

          <div className="absolute bottom-8 left-9 flex gap-2">
            <span className="h-8 w-8 rounded-full bg-[#743338]" />
            <span className="h-8 w-8 rounded-full bg-[#8d3c3b]" />
          </div>
          <div className="absolute bottom-7 right-9 h-10 w-16 rounded-t-full bg-[#5f9d48]">
            <span className="absolute bottom-1 left-3 h-8 w-2 rotate-[-18deg] rounded-full bg-[#2e7e40]" />
            <span className="absolute bottom-1 left-7 h-8 w-2 rotate-[12deg] rounded-full bg-[#2e7e40]" />
            <span className="absolute bottom-1 right-4 h-8 w-2 rotate-[28deg] rounded-full bg-[#2e7e40]" />
          </div>

          <div className="fridge-door absolute -right-[2.2rem] bottom-0 top-0 w-[8.7rem] rounded-[1.4rem] border-[0.45rem] border-white bg-[#f7f2ea] shadow-[-22px_22px_42px_-30px_rgba(40,28,20,0.92)]">
            <span className="absolute left-4 top-8 h-20 w-12 rounded-2xl bg-white/78 shadow-inner" />
            <span className="absolute left-4 top-[9.5rem] h-20 w-12 rounded-2xl bg-white/78 shadow-inner" />
            <span className="absolute left-4 bottom-14 h-20 w-12 rounded-2xl bg-white/78 shadow-inner" />
            <span className="absolute right-3 top-1/2 h-28 w-1 -translate-y-1/2 rounded-full bg-[#d1b895]" />
            <span className="absolute left-2 top-[7.2rem] h-1 w-[calc(100%-1rem)] rounded-full bg-[#e5d7c0]" />
          </div>
        </div>

        <div className="fridge-person absolute bottom-5 left-[7rem] h-[22rem] w-[18rem]">
          <span className="absolute left-[7.4rem] top-7 size-16 rounded-full bg-[#c78a67]" />
          <span className="absolute left-[6.1rem] top-3 h-20 w-20 rounded-full bg-[#2d1c17]" />
          <span className="absolute left-[5.8rem] top-[4.9rem] h-20 w-16 rounded-full bg-[#2d1c17]" />
          <span className="absolute left-[5.2rem] top-[6.6rem] h-[12.4rem] w-[8.6rem] rounded-[3rem_3rem_1.4rem_1.4rem] bg-[#f5dfb6] shadow-[inset_0_-18px_0_rgba(180,97,73,0.14)]" />
          <span className="absolute left-[6.1rem] top-[7.6rem] h-2 w-2 rounded-full bg-[#477c68]" />
          <span className="absolute left-[7.8rem] top-[8.8rem] h-2 w-2 rounded-full bg-[#477c68]" />
          <span className="absolute left-[10rem] top-[7.9rem] h-2 w-2 rounded-full bg-[#477c68]" />
          <span className="fridge-arm absolute left-[11rem] top-[9.2rem] h-5 w-[10.8rem] origin-left rounded-full bg-[#c98d69]">
            <span className="absolute -right-2 -top-1 size-7 rounded-full bg-[#c98d69]" />
          </span>
          <span className="absolute left-[4.7rem] top-[9.5rem] h-5 w-20 -rotate-[42deg] rounded-full bg-[#c98d69]" />
        </div>

        <span className="picked-vegetable absolute left-[28rem] top-[16rem] h-8 w-24 rounded-full bg-[#a9be50] shadow-[0_12px_26px_-18px_rgba(35,68,26,0.8)]" />
        <span className="absolute bottom-8 left-10 right-8 h-4 rounded-full bg-[#7d5938]/14 blur-md" />
      </div>
    </div>
  );
}

export default async function FridgeToolPage({
  searchParams,
}: {
  searchParams: ToolSearchParams;
}) {
  const params = await searchParams;
  const ingredients = parseIngredients(params);
  const ingredientLabels = Object.fromEntries(
    ingredients.map((ingredient) => [ingredient, titleCase(ingredient)]),
  );
  const initialRecipePage = await getInitialRecipePage(ingredients);
  const schema = [
    webApplicationJsonLd(),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "What Can I Cook With Ingredients?", path: pagePath },
    ]),
    itemListJsonLd(
      "Recipes you can cook with ingredients at home",
      initialRecipePage.recipes.map((recipe) => ({
        name: recipe.title,
        path: recipeHref(recipe),
        image: recipe.imageUrl,
      })),
    ),
    faqJsonLd(),
  ];

  return (
    <main className="home-surface min-h-screen pb-16 pt-8 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <style>{`
        .fridge-question-line {
          position: absolute;
          inset: 0 auto auto 0;
          display: block;
          max-width: 100%;
        }

        .fridge-question-one {
          animation: fridgeQuestionOne 7s infinite;
        }

        .fridge-question-two {
          animation: fridgeQuestionTwo 7s infinite;
        }

        @keyframes fridgeQuestionOne {
          0%, 42% {
            opacity: 1;
            transform: translateY(0);
          }
          50%, 92% {
            opacity: 0;
            transform: translateY(-0.22em);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fridgeQuestionTwo {
          0%, 42% {
            opacity: 0;
            transform: translateY(0.22em);
          }
          50%, 92% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(0.22em);
          }
        }

        .fridge-scene {
          filter: drop-shadow(0 34px 52px rgba(44, 29, 18, 0.18));
        }

        .fridge-glow {
          animation: fridgeGlow 4.8s ease-in-out infinite;
        }

        .fridge-door {
          transform-origin: right center;
          animation: fridgeDoorOpen 4.8s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .fridge-arm {
          animation: fridgeArmReach 4.8s ease-in-out infinite;
        }

        .picked-vegetable {
          animation: fridgePickVegetable 4.8s ease-in-out infinite;
        }

        .fridge-person {
          animation: fridgePersonLean 4.8s ease-in-out infinite;
        }

        @keyframes fridgeDoorOpen {
          0%, 100% {
            transform: perspective(900px) rotateY(-18deg) translateX(0);
          }
          28%, 78% {
            transform: perspective(900px) rotateY(-56deg) translateX(-0.55rem);
          }
        }

        @keyframes fridgeGlow {
          0%, 100% {
            opacity: 0.62;
            box-shadow: inset 0 0 32px rgba(139, 217, 195, 0.16);
          }
          30%, 76% {
            opacity: 1;
            box-shadow: inset 0 0 46px rgba(139, 217, 195, 0.36), 0 0 42px rgba(255, 255, 255, 0.72);
          }
        }

        @keyframes fridgeArmReach {
          0%, 18%, 100% {
            transform: rotate(-13deg) scaleX(0.78);
          }
          36%, 72% {
            transform: rotate(-5deg) scaleX(1.08);
          }
        }

        @keyframes fridgePickVegetable {
          0%, 22% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.96);
          }
          42%, 68% {
            opacity: 1;
            transform: translate(-3.2rem, 1.3rem) rotate(-8deg) scale(1);
          }
          86%, 100% {
            opacity: 0;
            transform: translate(-6.5rem, 4.2rem) rotate(-14deg) scale(0.9);
          }
        }

        @keyframes fridgePersonLean {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          36%, 72% {
            transform: translateX(0.4rem) rotate(1deg);
          }
        }
      `}</style>
      <Container>
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8b735f] dark:text-white/60">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-primary">
            Tools
          </Link>
          <span>/</span>
          <span className="text-primary">
            What Can I Cook With Ingredients?
          </span>
        </nav>

        <section className="mb-7 overflow-hidden rounded-[1.6rem] bg-[#201713] text-white shadow-[0_30px_90px_-50px_rgba(32,23,19,0.9)]">
          <div className="grid gap-0 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="mb-4 inline-flex items-center rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#f2cf8b]">
                Ingredient finder
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
                <span className="sr-only">
                  What&apos;s in your fridge? What can you cook today?
                </span>
                <span
                  aria-hidden="true"
                  className="relative block min-h-[6.6rem] sm:min-h-[8.8rem]"
                >
                  <span className="fridge-question-line fridge-question-one">
                    What&apos;s in your fridge?
                  </span>
                  <span className="fridge-question-line fridge-question-two">
                    What can you cook today?
                  </span>
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                Add what is actually available at home and open matching Indian
                recipes. Start with bottle gourd, potato, onion, tomato, rice,
                lentils, spinach, cauliflower, curd, or leftover rice.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={toolUrl(["bottle gourd"])}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f2cf8b] px-5 py-3 text-sm font-semibold text-[#201713] transition hover:bg-[#ffe2a2]"
                >
                  Start with bottle gourd
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={toolUrl(["onion", "tomato"])}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#f2cf8b] hover:bg-white/12"
                >
                  Try onion tomato
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {searchExamples.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold text-white/76"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="min-h-[32rem] bg-[#fff2d8]">
              <FridgeHeroScene />
            </div>
          </div>
        </section>

        <div id="fridge-tool" className="scroll-mt-28">
          <FridgeToolExperience
            key={ingredients.join("|")}
            initialIngredients={ingredients}
            initialIngredientLabels={ingredientLabels}
            initialRecipePage={initialRecipePage}
          />
        </div>

        <section className="mt-14 overflow-hidden rounded-[1.4rem] border border-[#ead9c3] bg-[#fffaf1] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
              <Link
                href={toolUrl(popularIngredientLinks[0].ingredients)}
                className="group relative flex min-h-[440px] overflow-hidden bg-[radial-gradient(circle_at_82%_18%,rgba(241,204,139,0.28),transparent_30%),linear-gradient(145deg,#4d3421,#201713)] p-6 text-white transition sm:p-8"
            >
              <span className="absolute -right-16 -top-14 h-52 w-52 rounded-full border border-white/12" />
              <span className="absolute -bottom-20 right-16 h-64 w-64 rounded-full bg-white/7 blur-2xl" />
              <span className="relative z-10 flex min-h-full flex-col justify-between">
                <span>
                  <span className="inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                    Featured search
                  </span>
                  <span className="mt-8 block max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                    Bottle gourd is still in the fridge.
                  </span>
                  <span className="mt-5 block max-w-md text-base leading-8 text-white/78">
                    The useful test is the everyday vegetable people ignore
                    until it has to be cooked. Open bottle gourd ideas, then add
                    lentils, tomato, onion, or curd.
                  </span>
                  <span className="mt-6 flex flex-wrap gap-2">
                    {["Opens finder", "Shows matching cards", "Add support items"].map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/14 bg-white/12 px-3 py-2 text-xs font-semibold text-white/82 backdrop-blur"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </span>
                </span>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                  Open bottle gourd ideas
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
            <div className="p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Ready searches
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#2e241c] dark:text-white">
                    Open the situation closest to your kitchen.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-[#756354] dark:text-white/64">
                  These links are real starting points. Open one, then add more
                  ingredients inside the finder.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {popularIngredientLinks.slice(1).map((item, index) => (
                  <Link
                    key={item.label}
                    href={toolUrl(item.ingredients)}
                    className={[
                      "group flex min-h-[116px] flex-col justify-between rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5c3219]/10",
                      index === 2
                        ? "border-[#201713] bg-[#201713] text-white sm:col-span-2"
                        : "border-[#ead9c3] bg-white text-[#45372e] dark:border-white/10 dark:bg-white/[0.05] dark:text-white",
                    ].join(" ")}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          index === 2
                            ? "bg-white/12 text-[#f2cf8b]"
                            : "bg-[#f1e4cf] text-primary",
                        ].join(" ")}
                      >
                        {item.eyebrow}
                      </span>
                      <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-1" />
                    </span>
                    <span>
                      <span className="mt-4 block text-base font-semibold">
                        {item.label}
                      </span>
                      <span
                        className={[
                          "mt-2 block text-sm leading-6",
                          index === 2 ? "text-white/68" : "text-[#756354] dark:text-white/64",
                        ].join(" ")}
                      >
                        {item.body}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.66fr_1.34fr] lg:items-start">
          <div className="rounded-[1.3rem] bg-[#201713] p-6 text-white sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2cf8b]">
              How to use it
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Search ingredients first, recipes second.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              This tool is useful when you are not sure what to make. Instead of
              guessing a recipe name, add the items available at home and let the
              recipe cards narrow the options.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["One ingredient", "Better combo", "Open recipe"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/72"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute bottom-4 left-5 top-4 hidden w-px bg-[#ead9c3] sm:block" />
            {howToSteps.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="relative mb-4 grid gap-3 rounded-xl border border-[#ead9c3] bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] sm:ml-10 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start"
                >
                  <span className="absolute -left-[3.25rem] top-4 hidden size-10 items-center justify-center rounded-full border border-[#ead9c3] bg-[#fffaf1] text-primary sm:flex">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-3 sm:block">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#f2e4cf] text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17135]">
                      Step {index + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold leading-6 text-[#2e241c] dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[#756354] dark:text-white/64">
                      {item.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[1.4rem] border border-[#ead9c3] bg-white dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="bg-[#fffaf1] p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Ask it naturally
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-[#2e241c] dark:text-white">
                Real kitchen questions this page should answer.
              </h2>
              <div className="mt-6 space-y-2">
                {searchExamples.slice(0, 4).map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-[#ead9c3] bg-white px-3 py-3 text-sm font-semibold text-[#45372e]"
                  >
                    <Search className="size-4 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-0 divide-y divide-[#ead9c3] dark:divide-white/10">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="p-4 dark:bg-transparent sm:p-5"
              >
                <h2 className="text-base font-semibold leading-6 text-[#2e241c] dark:text-white">
                  {item.question}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#756354] dark:text-white/64">
                  {item.answer}
                </p>
              </article>
            ))}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
