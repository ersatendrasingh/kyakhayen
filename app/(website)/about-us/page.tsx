import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, CookingPot, SlidersHorizontal } from "lucide-react";

import Container from "@/components/container";
import {
  InformationBoundary,
  SectionEyebrow,
  TrustHero,
} from "@/components/trust/trust-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "About Kya Khayen | Everyday Recipe Ideas and Meal Planning",
  description:
    "Learn how Kya Khayen helps people explore recipes and build taste-based meal plans without medical or health profiling.",
  path: "/about-us",
  image: "/meta-images/about-us.png",
  imageAlt: "About Kya Khayen recipe discovery and meal planning",
});

const waysWeHelp = [
  {
    icon: BookOpen,
    title: "Explore recipes",
    text: "Find dishes across mealtimes, cuisines and everyday cooking styles.",
  },
  {
    icon: SlidersHorizontal,
    title: "Share your taste",
    text: "Choose preferred food styles, cuisines and ingredients you want excluded.",
  },
  {
    icon: CalendarDays,
    title: "Plan a week",
    text: "Generate an organized seven-day set of meal ideas for your table.",
  },
  {
    icon: CookingPot,
    title: "Cook your way",
    text: "Keep planning grounded in the cooking effort that suits your routine.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="bg-[#fcf8f0] dark:bg-[#091712]">
      <TrustHero
        eyebrow="About Kya Khayen"
        title="Good food ideas for real everyday kitchens."
        description="Kya Khayen is a recipe discovery and meal-planning information platform. We help you find dishes, save inspiration and assemble weekly meal ideas around your stated food preferences."
        imageSrc="/assets/images/about-story-hero.webp"
        imageAlt="A mother and daughter in a kitchen surrounded by fresh ingredients"
        badge="Taste-based planning. No health or medical profiling."
        actions={[
          { href: "/recipes", label: "Explore recipes" },
          { href: "/meal-plan/create", label: "Create a meal plan", secondary: true },
        ]}
      />

      <Container>
        <InformationBoundary className="relative -mt-2 mb-12 lg:-mt-7" />

        <section className="pb-14 sm:pb-20">
          <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
            <div>
              <SectionEyebrow>What we build</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-semibold text-[#30261f] dark:text-[#f1f0e8]">
                A calm place to answer: what should we cook next?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#75675b] dark:text-[#aebbb4]">
                A busy week does not need another complicated system. Kya
                Khayen keeps discovery simple: browse a dish, save an idea or
                generate a weekly table using only the food choices you share.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {waysWeHelp.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[1.45rem] border border-[#ebdfcc] bg-[#fffdf8] p-5 dark:border-white/8 dark:bg-[#10241e]"
                >
                  <Icon className="mb-4 size-5 text-[#b93e30] dark:text-[#e1b265]" />
                  <h3 className="text-base font-semibold text-[#332820] dark:text-[#ecf1eb]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#75665b] dark:text-[#a9b8b0]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-14 sm:pb-20 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.8rem] border border-[#eadcc7] bg-white dark:border-white/10 dark:bg-[#10241e]">
            <div className="relative aspect-[1.75/1]">
              <Image
                src="/assets/images/our-mission.webp"
                alt="Everyday cooking ingredients arranged on a table"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-8">
              <SectionEyebrow>Our purpose</SectionEyebrow>
              <h2 className="mt-3 text-2xl font-semibold text-[#30261f] dark:text-[#eff3ec]">
                Make everyday meal decisions easier.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#716256] dark:text-[#adbbb3]">
                We organize recipes and meal ideas so home cooks can discover
                variety without spending the whole day planning. Our tools are
                for culinary inspiration and organization.
              </p>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-[#e8d9c4] bg-[#fffaf1] p-6 sm:p-8 dark:border-white/10 dark:bg-[#10241e]">
            <SectionEyebrow>What we do not do</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-[#30261f] dark:text-[#eff3ec]">
              No diagnosis. No treatment plans. No medical promises.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#716256] dark:text-[#adbbb3]">
              <p>
                We do not assess body type, disease, clinical goals, nutrition
                requirements or suitability of food for a medical condition.
              </p>
              <p>
                Recipe names, ingredients and meal-plan suggestions are
                informational. They should not be understood as professional
                dietetic, medical or therapeutic guidance.
              </p>
              <p>
                Food safety, ingredient labels, allergens and preparation
                conditions must always be checked by the person preparing or
                consuming a dish.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] bg-[#2b211b] px-6 py-9 text-white sm:px-10 lg:flex lg:items-center lg:justify-between dark:bg-[#122b23]">
          <div className="max-w-2xl">
            <SectionEyebrow>Start exploring</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Build a week of ideas around the food you enjoy.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Personalization uses everyday choices only: food style,
              cuisines, exclusions and cooking comfort.
            </p>
          </div>
          <Link
            href="/meal-plan/create"
            className="mt-7 inline-flex rounded-full bg-[#c64030] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ad3427] lg:mt-0"
          >
            Create my meal plan
          </Link>
        </section>
      </Container>
    </div>
  );
}
