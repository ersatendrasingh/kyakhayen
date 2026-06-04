import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");
const overwrite = process.argv.includes("--overwrite");
const source = "estimated-india-retail-2026";

const rules = [
  [/paneer|cottage cheese/, 45],
  [/tofu/, 28],
  [/chicken/, 28],
  [/mutton|lamb/, 80],
  [/fish|prawn|shrimp/, 42],
  [/\begg\b|eggs/, 12],
  [/ghee|clarified butter/, 65],
  [/butter/, 55],
  [/cheese/, 55],
  [/cream|malai/, 30],
  [/coconut milk/, 18],
  [/milk/, 6],
  [/curd|yogurt|dahi/, 8],
  [/coconut/, 9],
  [/almond|cashew|pistachio|walnut/, 90],
  [/peanut/, 18],
  [/sesame|sunflower seed|pumpkin seed|melon seed/, 22],
  [/mustard oil|coconut oil|olive oil|vegetable oil|oil/, 16],
  [/basmati rice/, 16],
  [/rice|chawal/, 7],
  [/wheat flour|atta|maida|flour/, 5],
  [/suji|semolina|rava/, 6],
  [/poha|flattened rice/, 7],
  [/bread/, 8],
  [/baguette/, 12],
  [/oats/, 16],
  [/noodle|pasta|macaroni/, 12],
  [/rajma|kidney bean/, 16],
  [/chickpea|chana|gram|besan/, 12],
  [/dal|lentil|moong|masoor|toor|urad/, 14],
  [/soybean|soya/, 13],
  [/potato|aloo/, 3],
  [/onion|pyaz/, 4],
  [/tomato|tamatar/, 4],
  [/cauliflower|gobhi|gobi/, 5],
  [/cabbage|patta gobhi/, 4],
  [/brinjal|baingan|eggplant/, 5],
  [/bhindi|okra/, 7],
  [/capsicum|bell pepper|shimla mirch/, 10],
  [/mushroom/, 20],
  [/peas|matar/, 9],
  [/carrot|gajar/, 5],
  [/beetroot|beet/, 5],
  [/spinach|palak|fenugreek|methi|greens|saag/, 4],
  [/bottle gourd|lauki|ridge gourd|turai|turiya|pumpkin|kaddu/, 4],
  [/cucumber|kakdi/, 4],
  [/beans/, 8],
  [/corn|sweet corn/, 7],
  [/ginger|adrak/, 16],
  [/garlic|lehsun/, 18],
  [/salt|namak|sendha/, 2],
  [/red chilli powder|chilli powder|mirchi powder/, 18],
  [/green chilli|chilli|mirchi/, 10],
  [
    /turmeric|haldi|cumin|jeera|mustard seed|rai|pepper|asafoetida|hing|masala|spice|powder|ajwain|carom|cinnamon|dalchini|star anise|chakri phool/,
    18,
  ],
  [/coriander leaves|cilantro|dhaniya leaves|mint|pudina|curry leaves/, 5],
  [/tulsi|basil leaves|colocasia leaves|arbi patta/, 5],
  [/lemon|lime/, 8],
  [/apple|banana|mango|orange|grape|fruit/, 10],
  [/chia seed|foxnut|makhana/, 35],
  [/jaggery|gur|sugar|honey/, 6],
  [/vinegar|soy sauce|mustard sauce|sauce/, 10],
  [/basil pesto|pesto/, 30],
  [/green chutney|tamarind chutney|chutney/, 8],
  [/tamarind|imli/, 12],
  [/baking soda|meetha soda|vanilla essence|essence/, 12],
  [/vanilla extract/, 120],
  [/wheat bran|bran/, 6],
  [/green tea|tea leaves/, 35],
  [/shallot/, 8],
  [/bone broth/, 25],
  [/arugula|lettuce/, 12],
  [/couscous/, 18],
  [/soy chop|soy stick/, 13],
  [/prune|plum/, 22],
  [/edible silver|varak/, 120],
  [/water/, 0.1],
];

const categoryFallbacks = [
  [/vegetable|produce|greens/, 6],
  [/spice|masala|seasoning/, 18],
  [/grain|cereal|flour|rice/, 7],
  [/pulse|lentil|legume|dal/, 14],
  [/dairy/, 10],
  [/fruit/, 10],
  [/oil|fat/, 16],
  [/meat|seafood|non veg|non-veg/, 35],
];

function normalized(value) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimatePrice(ingredient) {
  const text = normalized(
    `${ingredient.name} ${ingredient.slug ?? ""} ${ingredient.IngredientCategories?.name ?? ""} ${ingredient.IngredientCategories?.slug ?? ""}`,
  );

  for (const [pattern, priceInr] of rules) {
    if (pattern.test(text)) {
      return { marketPriceInr: priceInr, marketPriceBasisGrams: 100 };
    }
  }

  for (const [pattern, priceInr] of categoryFallbacks) {
    if (pattern.test(text)) {
      return { marketPriceInr: priceInr, marketPriceBasisGrams: 100 };
    }
  }

  return null;
}

async function main() {
  const ingredients = await db.ingredients.findMany({
    where: {
      RecipeIngredients: { some: {} },
      ...(overwrite ? {} : { marketPriceInr: null }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      marketPriceInr: true,
      IngredientCategories: { select: { name: true, slug: true } },
      _count: { select: { RecipeIngredients: true } },
    },
    orderBy: [{ RecipeIngredients: { _count: "desc" } }, { name: "asc" }],
  });

  const updates = [];
  const skipped = [];

  for (const ingredient of ingredients) {
    const estimate = estimatePrice(ingredient);

    if (!estimate) {
      skipped.push({
        id: ingredient.id,
        name: ingredient.name,
        recipeUsageCount: ingredient._count.RecipeIngredients,
      });
      continue;
    }

    updates.push({ ingredient, estimate });
  }

  if (apply) {
    for (const { ingredient, estimate } of updates) {
      await db.ingredients.update({
        where: { id: ingredient.id },
        data: {
          ...estimate,
          marketPriceSource: source,
          marketPriceUpdatedAt: new Date(),
        },
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        overwrite,
        matchedPrices: updates.length,
        skippedWithoutEstimate: skipped.length,
        sampleUpdates: updates.slice(0, 20).map(({ ingredient, estimate }) => ({
          name: ingredient.name,
          recipeUsageCount: ingredient._count.RecipeIngredients,
          ...estimate,
        })),
        sampleSkipped: skipped.slice(0, 20),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("[seed-ingredient-prices]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
