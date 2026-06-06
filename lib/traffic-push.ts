import {
  NotificationAudience,
  NotificationSource,
  type Prisma,
} from "@prisma/client";

import { db } from "@/lib/db";
import { createNotificationCampaign, sendNotificationCampaign } from "@/lib/notifications";
import { publishedRecipeAnd } from "@/lib/recipe-publication";

export const trafficPushSlotValues = [
  "breakfast",
  "midMorning",
  "lunch",
  "evening",
  "dinner",
] as const;

export type TrafficPushSlot = (typeof trafficPushSlotValues)[number];

type SlotConfig = {
  label: string;
  mealTimeSlugs: string[];
  recipeTypeSlugs: string[];
  requireMealTime?: boolean;
  excludeRecipeTypeSlugs?: string[];
  rejectTitlePattern?: RegExp;
  title: string;
  body: (recipeTitle: string) => string;
};

type TrafficRecipe = {
  id: string;
  title: string;
  slug: string;
  metaSlug: string | null;
  imageUrl: string | null;
};

type TrafficPushPreview = {
  skipped: false;
  slot: TrafficPushSlot;
  title: string;
  body: string;
  url: string;
  imageUrl: string | null;
  recipeId: string;
  recipeTitle: string;
};

export const trafficPushSchedules: Array<{
  slot: TrafficPushSlot;
  pattern: string;
}> = [
  { slot: "breakfast", pattern: "0 6 * * *" },
  { slot: "midMorning", pattern: "0 9 * * *" },
  { slot: "lunch", pattern: "30 12 * * *" },
  { slot: "evening", pattern: "30 16 * * *" },
  { slot: "dinner", pattern: "30 20 * * *" },
];

const slotConfig: Record<TrafficPushSlot, SlotConfig> = {
  breakfast: {
    label: "Breakfast",
    mealTimeSlugs: ["breakfast"],
    recipeTypeSlugs: [],
    requireMealTime: true,
    excludeRecipeTypeSlugs: ["desserts", "beverages", "drinks", "morning-hydration", "fruits"],
    rejectTitlePattern:
      /\b(water|juice|smoothie|shake|milkshake|lassi|sharbat|sherbet|lemonade|detox|infused|apple|banana|strawberry|orange|grapes|mango|papaya|watermelon|fruit)\b/i,
    title: "Breakfast kiya kya?",
    body: (recipeTitle) =>
      `Aaj ${recipeTitle} try karo. Subah ka mood set ho jayega.`,
  },
  midMorning: {
    label: "Mid-morning",
    mealTimeSlugs: ["early-morning"],
    recipeTypeSlugs: ["morning-hydration", "beverages", "drinks", "fruits"],
    excludeRecipeTypeSlugs: ["meal", "gravy", "curry", "sabzi", "desserts"],
    title: "Apple khaya kya?",
    body: (recipeTitle) =>
      `Bhool toh nahi gaye? ${recipeTitle} jaisa halka idea dekh lo.`,
  },
  lunch: {
    label: "Lunch",
    mealTimeSlugs: ["lunch"],
    recipeTypeSlugs: [],
    requireMealTime: true,
    excludeRecipeTypeSlugs: ["desserts", "snacks", "beverages", "drinks", "morning-hydration"],
    rejectTitlePattern:
      /\b(kheer|halwa|ladoo|laddu|barfi|burfi|cake|dessert|pudding|ice cream|smoothie|juice|water|shake|lassi|sharbat|tea|coffee)\b/i,
    title: "Lunch ka scene ready?",
    body: (recipeTitle) =>
      `${recipeTitle} dekh lo. Ghar ka lunch thoda aur exciting ho sakta hai.`,
  },
  evening: {
    label: "Evening snack",
    mealTimeSlugs: ["evening-snack", "snacks"],
    recipeTypeSlugs: ["snacks"],
    title: "Shaam ki chhoti bhookh?",
    body: (recipeTitle) =>
      `${recipeTitle} ka idea mast rahega. Tap karke recipe dekh lo.`,
  },
  dinner: {
    label: "Dinner",
    mealTimeSlugs: ["dinner"],
    recipeTypeSlugs: [],
    requireMealTime: true,
    excludeRecipeTypeSlugs: ["desserts", "snacks", "beverages", "drinks", "morning-hydration"],
    rejectTitlePattern:
      /\b(kheer|halwa|ladoo|laddu|barfi|burfi|cake|dessert|pudding|ice cream|smoothie|juice|water|shake|lassi|sharbat|tea|coffee)\b/i,
    title: "Dinner mein kya banega?",
    body: (recipeTitle) =>
      `${recipeTitle} se aaj ki plate special ho sakti hai.`,
  },
};

const indianCuisineSlugs = [
  "indian",
  "north-indian",
  "south-indian",
  "gujarati",
  "punjabi",
  "bengali",
  "maharashtrian",
  "rajasthani",
  "bihari",
];

function recipePath(recipe: Pick<TrafficRecipe, "slug" | "metaSlug">) {
  return recipe.metaSlug ? `${recipe.slug}-${recipe.metaSlug}` : recipe.slug;
}

function mealTimeWhere(slugs: string[]): Prisma.RecipesWhereInput {
  return {
    recipeMealTime: {
      some: {
        mealTime: {
          isPublished: true,
          slug: { in: slugs },
        },
      },
    },
  };
}

function recipeTypeWhere(slugs: string[]): Prisma.RecipesWhereInput {
  return {
    recipeRecipeType: {
      some: {
        recipeType: {
          isPublished: true,
          slug: { in: slugs },
        },
      },
    },
  };
}

function slotTaxonomyWhere(config: SlotConfig): Prisma.RecipesWhereInput {
  const OR: Prisma.RecipesWhereInput[] = [];
  if (config.mealTimeSlugs.length && config.requireMealTime) {
    return mealTimeWhere(config.mealTimeSlugs);
  }
  if (config.mealTimeSlugs.length) OR.push(mealTimeWhere(config.mealTimeSlugs));
  if (config.recipeTypeSlugs.length) {
    OR.push(recipeTypeWhere(config.recipeTypeSlugs));
  }
  return OR.length ? { OR } : {};
}

function excludedRecipeTypeWhere(config: SlotConfig): Prisma.RecipesWhereInput | null {
  if (!config.excludeRecipeTypeSlugs?.length) return null;
  return {
    NOT: recipeTypeWhere(config.excludeRecipeTypeSlugs),
  };
}

function indianCuisineWhere(): Prisma.RecipesWhereInput {
  return {
    recipeCuisine: {
      some: {
        cuisine: {
          isPublished: true,
          OR: [
            { slug: { in: indianCuisineSlugs } },
            { title: { contains: "Indian" } },
          ],
        },
      },
    },
  };
}

function istDateHour(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  return {
    dateKey: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour") || 0),
  };
}

function deterministicIndex(key: string, length: number) {
  const total = key
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return total % length;
}

async function findTrafficRecipes(slot: TrafficPushSlot, preferIndian: boolean) {
  const config = slotConfig[slot];
  const conditions: Prisma.RecipesWhereInput[] = [
    { imageUrl: { not: null } },
    { imageUrl: { not: "" } },
    slotTaxonomyWhere(config),
  ];
  const excludedTypes = excludedRecipeTypeWhere(config);
  if (excludedTypes) conditions.push(excludedTypes);
  if (preferIndian) conditions.push(indianCuisineWhere());

  const recipes = await db.recipes.findMany({
    where: publishedRecipeAnd(conditions),
    orderBy: [
      { views: "desc" },
      { contentUpdatedAt: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 24,
    select: {
      id: true,
      title: true,
      slug: true,
      metaSlug: true,
      imageUrl: true,
    },
  });
  return config.rejectTitlePattern
    ? recipes.filter((recipe) => !config.rejectTitlePattern?.test(recipe.title))
    : recipes;
}

async function chooseTrafficRecipe(slot: TrafficPushSlot, now: Date) {
  const indianRecipes = await findTrafficRecipes(slot, true);
  const recipes = indianRecipes.length
    ? indianRecipes
    : await findTrafficRecipes(slot, false);
  if (!recipes.length) return null;

  const { dateKey, hour } = istDateHour(now);
  return recipes[deterministicIndex(`${slot}-${dateKey}-${hour}`, recipes.length)];
}

export async function sendTrafficPush(slot: TrafficPushSlot, now = new Date()) {
  const preview = await previewTrafficPush(slot, now);
  if (preview.skipped) return preview;

  const { dateKey } = istDateHour(now);
  const campaign = await createNotificationCampaign({
    audience: NotificationAudience.ALL_SUBSCRIBERS,
    source: NotificationSource.PREFERENCE_PROMOTION,
    title: preview.title,
    body: preview.body,
    url: preview.url,
    imageUrl: preview.imageUrl,
    createdByName: "Traffic automation",
    dedupeKey: `traffic-push-${slot}-${dateKey}`,
  });
  const sent = await sendNotificationCampaign(campaign.id);

  return {
    skipped: false,
    slot,
    campaignId: sent.id,
    recipeId: preview.recipeId,
    recipeTitle: preview.recipeTitle,
    recipients: sent.totalRecipients,
    delivered: sent.successfulDeliveries,
    failed: sent.failedDeliveries,
  };
}

export async function previewTrafficPush(
  slot: TrafficPushSlot,
  now = new Date(),
): Promise<TrafficPushPreview | { skipped: true; reason: string }> {
  const config = slotConfig[slot];
  const recipe = await chooseTrafficRecipe(slot, now);
  if (!recipe) {
    return { skipped: true, reason: `No published ${config.label} recipe with image found.` };
  }

  return {
    skipped: false,
    slot,
    title: config.title,
    body: config.body(recipe.title),
    url: `/${recipePath(recipe)}`,
    imageUrl: recipe.imageUrl,
    recipeId: recipe.id,
    recipeTitle: recipe.title,
  };
}
