import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ArrowRight, Leaf, SunMedium } from "lucide-react";

import Container from "@/components/container";
import Copyrights from "@/components/footer/copyrights";
import { db } from "@/lib/db";

const Footer = async () => {
  const [categories, mealTimes, cuisineResults, recipeTypes] = await Promise.all([
    db.recipeCategories.findMany({
      where: { isPublished: true, recipe: { some: { isPublished: true } } },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
    db.mealTimes.findMany({
      where: {
        isPublished: true,
        recipeMealTime: { some: { recipe: { isPublished: true } } },
      },
      orderBy: [{ position: "asc" }, { title: "asc" }],
    }),
    db.cuisines.findMany({
      where: {
        isPublished: true,
        recipeCuisine: { some: { recipe: { isPublished: true } } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { recipeCuisine: true } },
      },
      orderBy: { title: "asc" },
    }),
    db.recipeTypes.findMany({
      where: {
        isPublished: true,
        recipeRecipeType: { some: { recipe: { isPublished: true } } },
      },
      select: { id: true, title: true, slug: true },
      orderBy: [{ position: "asc" }, { title: "asc" }],
      take: 9,
    }),
  ]);
  const cuisines = cuisineResults
    .sort((left, right) => {
      if (left.slug === "north-indian") return -1;
      if (right.slug === "north-indian") return 1;
      return right._count.recipeCuisine - left._count.recipeCuisine;
    })
    .slice(0, 9);

  return (
    <footer className="site-footer border-t border-border bg-[#18130f] pt-12 text-white sm:pt-16">
      <Container>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 pb-9 text-left sm:gap-x-8 sm:pb-11 lg:grid-cols-[1.7fr_.72fr_.82fr_.82fr_1fr_1fr]">
          <div className="footer-story-card relative col-span-2 min-h-[292px] overflow-hidden rounded-[1.8rem] text-left sm:min-h-[342px] lg:col-span-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(236,191,94,0.23),transparent_42%),linear-gradient(145deg,#304d37,#12100e_72%)]" />
            <Image
              src="/assets/images/smoothie.png"
              alt="Fresh fruit smoothies and ingredients"
              fill
              sizes="(max-width: 1024px) 100vw, 360px"
              className="object-contain object-[92%_10%] p-4 opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#130e0a] via-[#130e0a]/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f4cf89]">
                <Leaf className="size-3.5" /> Discover your next plate
              </p>
              <h2 className="max-w-[285px] text-2xl font-semibold leading-tight">
                Indian recipes and beautiful everyday inspiration.
              </h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Explore recipes <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/recipes?k=summer&type=season"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold"
                >
                  <SunMedium className="size-3.5 text-[#f4cf89]" /> Summer
                </Link>
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8d18a]">
              Explore
            </h4>
            <nav className="text-sm text-white/68">
              <Link href="/" className="mb-3 block transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/recipes" className="mb-3 block transition-colors hover:text-white">
                All Recipes
              </Link>
              <Link href="/blog" className="mb-3 block transition-colors hover:text-white">
                Articles
              </Link>
              <Link href="/download-app" className="mb-3 block transition-colors hover:text-white">
                Download App
              </Link>
              <Link href="/contact-us" className="mb-3 block transition-colors hover:text-white">
                Contact Us
              </Link>
            </nav>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8d18a]">
              Preferences
            </h5>
            <nav className="text-sm text-white/68">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/recipes?k=${category.slug}&type=category`}
                  className="mb-3 block transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8d18a]">
              Mealtimes
            </h5>
            <nav className="text-sm text-white/68">
              {mealTimes.map((mealTime) => (
                <Link
                  key={mealTime.id}
                  href={`/recipes?k=${mealTime.slug}&type=mealTime`}
                  className="mb-3 block transition-colors hover:text-white"
                >
                  {mealTime.title}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8d18a]">
              Cuisines
            </h5>
            <nav className="text-sm text-white/68">
              {cuisines.map((cuisine) => (
                <Link
                  key={cuisine.id}
                  href={`/recipes?k=${cuisine.slug}&type=cuisine`}
                  className="mb-3 block transition-colors hover:text-white"
                >
                  {cuisine.title}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8d18a]">
              Recipe ideas
            </h5>
            <nav className="text-sm text-white/68">
              {recipeTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/recipes?k=${type.slug}&type=recipeType`}
                  className="mb-3 block transition-colors hover:text-white"
                >
                  {type.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mb-8 rounded-[1.5rem] border border-white/8 bg-white/[0.025] px-5 py-6 sm:px-7">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.23em] text-[#f8d18a] md:text-left">
            Popular food searches
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
            {[
              ["Healthy vegetarian recipes", "/recipes?k=veg&type=category"],
              ["North Indian dinner ideas", "/recipes?k=north-indian&type=cuisine"],
              ["South Indian breakfast recipes", "/recipes?k=south-indian&type=cuisine"],
              ["Cooling summer recipes", "/recipes?k=summer&type=season"],
              ["Smoothies and beverages", "/recipes?k=beveragesmoothie&type=recipeType"],
              ["Quick snack recipes", "/recipes?k=snacks&type=recipeType"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs text-white/66 transition hover:border-[#d79b42]/55 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 py-6 md:flex-row">
          <div className="flex gap-5 text-sm text-white/58">
            <Link href="/about-us" className="hover:text-white">About</Link>
            <Link href="/contact-us" className="hover:text-white">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/58">Follow us</span>
            <a
              href="https://www.facebook.com/mailtokyakhayen"
              target="_blank"
              rel="noreferrer"
              aria-label="Kya Khayen on Facebook"
              className="text-white/62 transition hover:text-[#f8d18a]"
            >
              <FaFacebook className="size-5" />
            </a>
            <a
              href="https://twitter.com/kyakhayen"
              target="_blank"
              rel="noreferrer"
              aria-label="Kya Khayen on X"
              className="text-white/62 transition hover:text-[#f8d18a]"
            >
              <FaXTwitter className="size-5" />
            </a>
            <a
              href="https://www.youtube.com/channel/UC-kmoWXdqoZaUDSpemR2hCw"
              target="_blank"
              rel="noreferrer"
              aria-label="Kya Khayen on YouTube"
              className="text-white/62 transition hover:text-[#f8d18a]"
            >
              <FaYoutube className="size-5" />
            </a>
            <a
              href="https://www.instagram.com/kyakhayen/"
              target="_blank"
              rel="noreferrer"
              aria-label="Kya Khayen on Instagram"
              className="text-white/62 transition hover:text-[#f8d18a]"
            >
              <FaInstagram className="size-5" />
            </a>
          </div>
        </div>
      </Container>
      <Copyrights />
    </footer>
  );
};

export default Footer;
