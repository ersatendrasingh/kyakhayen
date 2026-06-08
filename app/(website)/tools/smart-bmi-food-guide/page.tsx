import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, HeartPulse, Scale, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Container from "@/components/container";
import SmartBmiFoodGuide, {
  type BmiToolRecipe,
} from "@/components/sections/bmi-tool/smart-bmi-food-guide";
import { db } from "@/lib/db";
import { publishedRecipeWhere } from "@/lib/recipe-publication";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildSeoMetadata,
  jsonLd,
  recipeHref,
} from "@/lib/seo";

const pagePath = "/tools/smart-bmi-food-guide";
const pageTitle = "Smart BMI & Food Guide";
const pageDescription =
  "Use Smart BMI & Food Guide to calculate BMI, compare standard and Indian BMI ranges, check healthy weight range, get roti/rice portions, weekly check-ins, and recipe ideas from Kya Khayen.";

export const revalidate = 3600;

export const metadata: Metadata = buildSeoMetadata({
  title: "Smart BMI & Food Guide: Indian BMI Calculator with Meal Ideas",
  description: pageDescription,
  path: pagePath,
  image: "/meta-images/home-og-2026.png",
  imageAlt: "Smart BMI and food guide by Kya Khayen",
  keywords: [
    "BMI calculator India",
    "Indian BMI calculator",
    "South Asian BMI calculator",
    "BMI calculator with diet plan",
    "BMI calculator with meal plan",
    "healthy weight calculator India",
    "BMI calculator with roti rice diet",
    "weight loss meal plan by BMI",
    "healthy weight range calculator",
    "Indian food guide by BMI",
  ],
});

const faqs = [
  {
    question: "What makes Smart BMI & Food Guide different?",
    answer:
      "It does not stop at a BMI number. It shows a selected BMI range, healthy weight range, target guide, roti/rice plate ideas, weekly check-ins, and recipe suggestions from Kya Khayen.",
  },
  {
    question: "Can I use Indian or South Asian BMI ranges?",
    answer:
      "Yes. The tool lets you switch between standard adult BMI ranges and an Indian/South Asian mode with lower action points.",
  },
  {
    question: "Does this tool give medical advice?",
    answer:
      "No. It is a general wellness and educational tool, not a diagnosis or treatment plan. Please consult a qualified doctor or dietitian for medical decisions.",
  },
  {
    question: "Does it save my weekly check-ins?",
    answer:
      "Weekly check-ins are stored on your current device using browser storage so you can compare next week without creating a medical record.",
  },
  {
    question: "Can I get recipe ideas after the BMI result?",
    answer:
      "Yes. The result recommends Kya Khayen recipes based on the selected food style and the BMI result category.",
  },
];

function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: pageTitle,
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

async function getBmiToolRecipes(): Promise<BmiToolRecipe[]> {
  const recipes = await db.recipes.findMany({
    where: {
      ...publishedRecipeWhere(),
      imageUrl: { not: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      metaSlug: true,
      imageUrl: true,
      views: true,
      RecipeCategories: { select: { name: true } },
      recipeCookingTime: {
        select: { prepTime: true, cookTime: true, restTime: true },
      },
      recipeIngredients: {
        select: {
          ingredient: { select: { name: true } },
        },
        orderBy: { position: "asc" },
        take: 14,
      },
      recipeRecipeType: {
        where: { recipeType: { isPublished: true } },
        select: { recipeType: { select: { title: true } } },
        take: 6,
      },
      recipeMealTime: {
        where: { mealTime: { isPublished: true } },
        select: { mealTime: { select: { title: true } } },
        take: 5,
      },
      recipeDietType: {
        where: { dietType: { isPublished: true } },
        select: { dietType: { select: { title: true } } },
        take: 5,
      },
      recipeNutrient: {
        where: { nutrient: { isPublished: true } },
        select: { nutrient: { select: { title: true } } },
        take: 5,
      },
    },
    orderBy: [{ views: "desc" }, { updatedAt: "desc" }],
    take: 90,
  });

  return recipes.map((recipe) => {
    const totalMinutes =
      (recipe.recipeCookingTime?.prepTime ?? 0) +
      (recipe.recipeCookingTime?.cookTime ?? 0) +
      (recipe.recipeCookingTime?.restTime ?? 0);

    return {
      id: recipe.id,
      title: recipe.title,
      href: recipeHref(recipe),
      imageUrl: recipe.imageUrl || "/assets/images/default-recipe.png",
      category: recipe.RecipeCategories?.name ?? null,
      totalMinutes: totalMinutes || null,
      ingredients: recipe.recipeIngredients.map((item) => item.ingredient.name),
      recipeTypes: recipe.recipeRecipeType.map((item) => item.recipeType.title),
      mealTimes: recipe.recipeMealTime.map((item) => item.mealTime.title),
      dietTypes: recipe.recipeDietType.map((item) => item.dietType.title),
      nutrients: recipe.recipeNutrient.map((item) => item.nutrient.title),
      views: recipe.views,
    };
  });
}

export default async function SmartBmiFoodGuidePage() {
  const recipes = await getBmiToolRecipes();
  const schema = [
    webApplicationJsonLd(),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
      { name: pageTitle, path: pagePath },
    ]),
    faqJsonLd(),
  ];

  return (
    <main className="home-surface min-h-screen pb-16 pt-8 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
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
          <span className="text-primary">{pageTitle}</span>
        </nav>

        <section className="mb-8 overflow-hidden rounded-[1.7rem] border border-[#ead9c3] bg-[#fffaf1] shadow-[0_28px_86px_-58px_rgba(63,38,21,0.72)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead9c3] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#a04735] shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-[#f3ca7a]">
                <HeartPulse className="size-3.5" />
                BMI plus food action
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#2e241c] dark:text-white sm:text-6xl">
                Smart BMI & Food Guide
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#756354] dark:text-white/64 sm:text-lg">
                Calculate BMI, switch between standard and Indian/South Asian ranges, add waist context, then turn the result into roti/rice portions, recipe ideas and a weekly check-in habit.
              </p>
              <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
                <a
                  href="#tool"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 sm:w-auto"
                >
                  Start calculator <ArrowRight className="size-4" />
                </a>
                <Link
                  href="/meal-plan/create"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#dfc6a8] bg-white px-5 py-3 text-sm font-semibold text-[#3a2b20] transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:w-auto"
                >
                  Create meal plan
                </Link>
              </div>
            </div>
            <div className="relative min-h-[29rem] overflow-hidden border-t border-[#ead9c3] dark:border-white/10 sm:min-h-[32rem] lg:min-h-full lg:border-l lg:border-t-0">
              <Image
                src="/assets/images/auth-fruit-prep-hero.webp"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[50%_18%] lg:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17372b]/64 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 sm:inset-x-5 sm:bottom-5 sm:gap-3">
                {[
                  { icon: Scale, label: "BMI" },
                  { icon: Utensils, label: "Plate" },
                  { icon: CheckCircle2, label: "Check-in" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/18 bg-[#17372b]/86 p-3 text-white shadow-lg shadow-[#17372b]/25 sm:p-4"
                    >
                      <Icon className="mb-2 size-4 text-[#f3ca7a] sm:mb-3 sm:size-5" />
                      <p className="text-xs font-semibold leading-tight sm:text-sm">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <SmartBmiFoodGuide recipes={recipes} />

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "BMI with Indian context",
              body: "Switch between standard adult BMI and Indian/South Asian mode before reading the result.",
            },
            {
              title: "Food-first recommendations",
              body: "The tool turns the number into practical food moves, roti/rice portions and recipe links.",
            },
            {
              title: "Designed for repeat use",
              body: "Weekly check-ins and a shareable report card make it useful beyond one quick calculation.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.2rem] border border-[#ead9c3] bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h2 className="text-lg font-semibold text-[#2e241c] dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#756354] dark:text-white/64">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[1.5rem] border border-[#ead9c3] bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary dark:text-[#f3ca7a]">
            Questions
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-2xl bg-[#fffaf2] p-5 dark:bg-white/[0.04]">
                <h2 className="text-base font-semibold text-[#2e241c] dark:text-white">{item.question}</h2>
                <p className="mt-2 text-sm leading-7 text-[#756354] dark:text-white/64">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
