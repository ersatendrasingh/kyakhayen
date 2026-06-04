import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");
const publishedOnly = process.argv.includes("--published-only");

const ruleSets = [
  {
    name: "north-punjabi-shared",
    cuisineSlugs: ["north-indian", "punjabi"],
    patterns: [
      /\brajma\s+chawal\b/,
      /\bchole\s+bhature\b/,
      /\bchole\s+kulche\b/,
      /\bpunjabi\s+chole\b/,
      /\bamritsari\s+chole\b/,
      /\bdal\s+makhani\b/,
      /\bpaneer\s+butter\s+masala\b/,
      /\bbutter\s+paneer\b/,
      /\bchana\s+masala\b/,
    ],
    exclusive: true,
  },
  {
    name: "bihari",
    cuisineSlugs: ["bihari"],
    patterns: [
      /\blitti\b/,
      /\bchokha\b/,
      /\bsattu\b/,
      /\bthekua\b/,
      /\bmakhana\b/,
      /\bparwal\b/,
      /\bbihari\b/,
    ],
    exclusive: true,
  },
  {
    name: "rajasthani",
    cuisineSlugs: ["rajasthani"],
    patterns: [
      /\bdal\s+baati\b/,
      /\bbaati\b/,
      /\bchurma\b/,
      /\bgatte?\b/,
      /\bker\s+sangri\b/,
      /\blaal\s+maas\b/,
      /\bsafed\s+maas\b/,
      /\bpapad\s+ki\s+sabzi\b/,
      /\bmangodi\b/,
      /\brajasthani\b/,
    ],
    exclusive: true,
  },
  {
    name: "gujarati",
    cuisineSlugs: ["gujarati"],
    patterns: [
      /\bdhokla\b/,
      /\bkhaman\b/,
      /\bkhandvi\b/,
      /\bhandvo\b/,
      /\bthepla\b/,
      /\bundhiyu\b/,
      /\bpatra\b/,
      /\bfafda\b/,
      /\bdal\s+dhokli\b/,
      /\bsev\s+tameta\b/,
      /\bbatata\s+nu\b/,
      /\bringan\b/,
      /\bgujarati\b/,
    ],
    exclusive: true,
  },
  {
    name: "south-indian",
    cuisineSlugs: ["south-indian"],
    patterns: [
      /\bdosa\b/,
      /\bidli\b/,
      /\bsambar\b/,
      /\brasam\b/,
      /\bmedu\s+vada\b/,
      /\bvadas?\s+sambar\b/,
      /\bsambar\s+vadas?\b/,
      /\bappam\b/,
      /\bputtu\b/,
      /\bporiyal\b/,
      /\bavial\b/,
      /\bpongal\b/,
      /\bupma\b/,
      /\buttapam\b/,
      /\bbisi\s+bele\b/,
      /\bpuliyogare\b/,
      /\blemon\s+rice\b/,
      /\bcurd\s+rice\b/,
      /\bcoconut\s+chutney\b/,
      /\bsouth\s+indian\b/,
    ],
    exclusive: true,
  },
  {
    name: "hyderabadi",
    cuisineSlugs: ["hyderabadi"],
    patterns: [
      /\bhyderabadi\b/,
      /\bhyderabadi\s+biryani\b/,
      /\bmirchi\s+ka\s+salan\b/,
      /\bbaghara\s+baingan\b/,
      /\bdouble\s+ka\s+meetha\b/,
      /\bhaleem\b/,
    ],
    exclusive: true,
  },
  {
    name: "kashmiri",
    cuisineSlugs: ["kashmiri"],
    patterns: [
      /\bkashmiri\b/,
      /\brogan\s+josh\b/,
      /\byakhni\b/,
      /\bgushtaba\b/,
      /\brista\b/,
      /\bhaak\b/,
      /\bnadru\b/,
    ],
    exclusive: true,
  },
  {
    name: "awadhi",
    cuisineSlugs: ["awadhi"],
    patterns: [
      /\bawadhi\b/,
      /\blucknowi\b/,
      /\bdum\s+pukht\b/,
      /\bgalouti\b/,
      /\bkakori\b/,
      /\bnihari\b/,
    ],
    exclusive: true,
  },
  {
    name: "bengali",
    cuisineSlugs: ["bengali"],
    patterns: [
      /\bbengali\b/,
      /\bposto\b/,
      /\bshorshe\b/,
      /\bshorshe\s+ilish\b/,
      /\bilish\b/,
      /\bmacher\s+jhol\b/,
      /\bmachhli\s+jhor\b/,
      /\bkosha\s+mangsho\b/,
      /\bcholar\s+dal\b/,
      /\bluchi\b/,
      /\bdoi\s+maach\b/,
      /\bjhal\s+muri\b/,
    ],
    exclusive: true,
  },
  {
    name: "assamese",
    cuisineSlugs: ["assamese"],
    patterns: [
      /\bassamese\b/,
      /\bkhar\b/,
      /\btenga\b/,
      /\bpitha\b/,
    ],
    exclusive: true,
  },
  {
    name: "chinese",
    cuisineSlugs: ["chinese"],
    patterns: [
      /\bhakka\b/,
      /\bnoodles?\b/,
      /\bmanchurian\b/,
      /\bmomos?\b/,
      /\bchow\s?mein\b/,
      /\bschezwan\b/,
      /\bspring\s+rolls?\b/,
      /\bchilli\s+(paneer|potato|chicken|mushroom)\b/,
      /\bhoney\s+chilli\b/,
      /\bfried\s+rice\b/,
      /\bmanchow\b/,
      /\bhot\s+and\s+sour\b/,
      /\bsweet\s+corn\s+soup\b/,
      /\bchinese\b/,
    ],
    exclusive: true,
  },
  {
    name: "goan",
    cuisineSlugs: ["goan"],
    patterns: [
      /\bgoan\b/,
      /\bxacuti\b/,
      /\bvindaloo\b/,
      /\bsorpotel\b/,
      /\bbebinca\b/,
    ],
    exclusive: true,
  },
  {
    name: "maharashtrian",
    cuisineSlugs: ["maharashtrian"],
    patterns: [
      /\bpav\s+bhaji\b/,
      /\bmisal\s+pav\b/,
      /\bvada\s+pav\b/,
      /\bbharli\s+vangi\b/,
      /\bvaran\s+bhaat\b/,
      /\bmatki\s+usal\b/,
      /\busal\b/,
      /\bpuran\s+poli\b/,
      /\bmodak\b/,
      /\bkolhapuri\b/,
      /\bmalvani\b/,
      /\bkolambi\b/,
      /\bbombil\b/,
      /\bsol\s+kadhi\b/,
      /\bzunka\b/,
      /\bpithla\b/,
      /\bbhakri\b/,
      /\bthecha\b/,
      /\bsabudana\s+(vada|khichdi)\b/,
      /\bkanda\s+poha\b/,
      /\bdadpe\s+pohe\b/,
      /\bpohe?\b/,
      /\bthalipeeth\b/,
      /\bkothimbir\s+vadi\b/,
      /\bchakli\b/,
      /\bkaranji\b/,
      /\btambda\s+rassa\b/,
      /\bpandhra\s+rassa\b/,
      /\bnarali\s+bhaat\b/,
      /\bmasale\s+bhaat\b/,
      /\bmaharashtrian\b/,
    ],
    exclusive: true,
  },
  {
    name: "west-indian",
    cuisineSlugs: ["west-indian"],
    patterns: [
      /\bwest\s+indian\b/,
    ],
    exclusive: true,
  },
  {
    name: "punjabi",
    cuisineSlugs: ["punjabi"],
    patterns: [
      /\bsarson?\s+(da\s+)?saag\b/,
      /\bmakki\s+(di\s+)?roti\b/,
      /\bkadhi\s+pakora\b/,
      /\bpaneer\s+lababdar\b/,
      /\bamritsari\b/,
      /\bpunjabi\b/,
    ],
    exclusive: true,
  },
  {
    name: "mughlai",
    cuisineSlugs: ["mughlai"],
    patterns: [
      /\bmughlai\b/,
      /\bnihari\b/,
      /\bkorma\b/,
      /\bqorma\b/,
      /\bpasanda\b/,
      /\brezala\b/,
      /\bkebabs?\b/,
      /\bkofta\b/,
      /\bshahi\s+tukda\b/,
    ],
    exclusive: true,
  },
  {
    name: "international-mediterranean",
    cuisineSlugs: ["international-mediterranean"],
    patterns: [
      /\bmediterranean\b/,
      /\binternational\s+mediterranean\b/,
    ],
    exclusive: true,
  },
  {
    name: "italian",
    cuisineSlugs: ["italian"],
    patterns: [
      /\bitalian\b/,
      /\bpasta\b/,
      /\blasagna\b/,
      /\brisotto\b/,
      /\bpizza\b/,
      /\bbruschetta\b/,
      /\bgnocchi\b/,
      /\bravioli\b/,
    ],
    exclusive: true,
  },
  {
    name: "greek",
    cuisineSlugs: ["greek"],
    patterns: [
      /\bgreek\s+(salad|moussaka|souvlaki|spanakopita)\b/,
      /\bmoussaka\b/,
      /\bspanakopita\b/,
      /\bsouvlaki\b/,
    ],
    exclusive: true,
  },
  {
    name: "middle-eastern",
    cuisineSlugs: ["middle-eastern"],
    patterns: [
      /\bmiddle\s+eastern\b/,
      /\bfalafel\b/,
      /\bhummus\b/,
      /\bshakshuka\b/,
      /\bpita\b/,
      /\bshawarma\b/,
    ],
    exclusive: true,
  },
  {
    name: "lebanese",
    cuisineSlugs: ["lebanese"],
    patterns: [
      /\blebanese\b/,
      /\btabbouleh\b/,
      /\bfattoush\b/,
      /\bmanakish\b/,
    ],
    exclusive: true,
  },
  {
    name: "turkish",
    cuisineSlugs: ["turkish"],
    patterns: [
      /\bturkish\b/,
      /\bbaklava\b/,
      /\bmenemen\b/,
      /\bdoner\b/,
    ],
    exclusive: true,
  },
  {
    name: "spanish",
    cuisineSlugs: ["spanish"],
    patterns: [
      /\bspanish\b/,
      /\bpaella\b/,
      /\btortilla\s+espanola\b/,
      /\bgazpacho\b/,
    ],
    exclusive: true,
  },
  {
    name: "french",
    cuisineSlugs: ["french"],
    patterns: [
      /\bfrench\s+(toast|onion\s+soup|ratatouille|quiche|crepe)\b/,
      /\bratatouille\b/,
      /\bquiche\b/,
      /\bcrepe\b/,
    ],
    exclusive: true,
  },
  {
    name: "thai",
    cuisineSlugs: ["thai"],
    patterns: [
      /\bthai\b/,
      /\bpad\s+thai\b/,
      /\btom\s+yum\b/,
      /\bthai\s+green\s+curry\b/,
      /\bthai\s+red\s+curry\b/,
    ],
    exclusive: true,
  },
  {
    name: "mexican",
    cuisineSlugs: ["mexican"],
    patterns: [
      /\bmexican\b/,
      /\btacos?\b/,
      /\bburrito\b/,
      /\bquesadilla\b/,
      /\bnachos\b/,
      /\benchilada\b/,
    ],
    exclusive: true,
  },
  {
    name: "japanese",
    cuisineSlugs: ["japanese"],
    patterns: [
      /\bjapanese\b/,
      /\bsushi\b/,
      /\bramen\b/,
      /\btempura\b/,
      /\bteriyaki\b/,
    ],
    exclusive: true,
  },
  {
    name: "korean",
    cuisineSlugs: ["korean"],
    patterns: [
      /\bkorean\b/,
      /\bkimchi\b/,
      /\bbibimbap\b/,
      /\btteokbokki\b/,
    ],
    exclusive: true,
  },
  {
    name: "vietnamese",
    cuisineSlugs: ["vietnamese"],
    patterns: [
      /\bvietnamese\b/,
      /\bpho\b/,
      /\bbanh\s+mi\b/,
    ],
    exclusive: true,
  },
  {
    name: "american",
    cuisineSlugs: ["american"],
    patterns: [
      /\bmac\s+and\s+cheese\b/,
      /\bburger\b/,
      /\bhot\s+dog\b/,
      /\bmeatloaf\b/,
      /\bbarbecue\b/,
      /\bbbq\b/,
      /\bfried\s+chicken\b/,
      /\bamerican\b/,
    ],
    exclusive: true,
  },
  {
    name: "north-indian",
    cuisineSlugs: ["north-indian"],
    patterns: [
      /\bkadhi\s+chawal\b/,
      /\bpalak\s+paneer\b/,
      /\bshahi\s+paneer\b/,
      /\bkadhai\s+paneer\b/,
      /\bkadai\s+paneer\b/,
      /\bmatar\s+paneer\b/,
      /\bpaneer\s+do\s+pyaza\b/,
      /\bpaneer\s+angara\b/,
      /\bmalai\s+kofta\b/,
      /\bdum\s+aloo\b/,
      /\baloo\s+gobi\b/,
      /\bbhindi\s+masala\b/,
      /\bbaingan\s+bharta\b/,
      /\bdal\s+tadka\b/,
      /\bdal\s+fry\b/,
      /\blauki\s+chana\s+dal\b/,
      /\bnorth\s+indian\b/,
    ],
    exclusive: false,
  },
];

const broadCleanupCuisineSlugs = [
  "indian",
  "north-indian",
  "east-indian",
  "west-indian",
  "international-mediterranean",
  "international-pan-asian",
  "international-continental",
  "international-latino",
  "european",
  "fusion",
];

const managedCuisineSlugs = new Set([
  ...ruleSets.flatMap((ruleSet) => ruleSet.cuisineSlugs),
  ...broadCleanupCuisineSlugs,
]);

function normalize(value) {
  return (value || "")
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

function inferCuisineSlugs(recipe) {
  const text = normalize(
    [recipe.title, recipe.slug, recipe.metaTitle, recipe.metaDescription]
      .filter(Boolean)
      .join(" "),
  );
  const exclusiveMatches = ruleSets.filter(
    (ruleSet) =>
      ruleSet.exclusive &&
      ruleSet.patterns.some((pattern) => pattern.test(text)),
  );

  if (exclusiveMatches.length > 0) {
    return unique(exclusiveMatches.flatMap((ruleSet) => ruleSet.cuisineSlugs));
  }

  return unique(
    ruleSets
      .filter(
        (ruleSet) =>
          !ruleSet.exclusive &&
          ruleSet.patterns.some((pattern) => pattern.test(text)),
      )
      .flatMap((ruleSet) => ruleSet.cuisineSlugs),
  );
}

function compactRecipe(recipe, desiredSlugs, addSlugs, removeSlugs) {
  return {
    title: recipe.title,
    slug: recipe.slug,
    current: recipe.recipeCuisine.map((item) => item.cuisine.slug),
    desired: desiredSlugs,
    add: addSlugs,
    remove: removeSlugs,
  };
}

async function main() {
  const cuisines = await db.cuisines.findMany({
    where: { slug: { in: [...managedCuisineSlugs] } },
    select: { id: true, slug: true, title: true },
  });
  const cuisineBySlug = new Map(cuisines.map((cuisine) => [cuisine.slug, cuisine]));
  const missingCuisineSlugs = [...managedCuisineSlugs].filter(
    (slug) => !cuisineBySlug.has(slug),
  );

  if (missingCuisineSlugs.length > 0) {
    throw new Error(`Missing cuisine records: ${missingCuisineSlugs.join(", ")}`);
  }

  const recipes = await db.recipes.findMany({
    where: publishedOnly ? { isPublished: true } : {},
    select: {
      id: true,
      title: true,
      slug: true,
      metaTitle: true,
      metaDescription: true,
      isPublished: true,
      recipeCuisine: {
        select: {
          id: true,
          cuisineId: true,
          cuisine: { select: { title: true, slug: true } },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: [{ isPublished: "desc" }, { views: "desc" }, { updatedAt: "desc" }],
  });

  const changes = [];
  const duplicateRelationIds = [];
  let highConfidenceMatches = 0;
  let unchangedMatches = 0;
  let skippedNoSignal = 0;

  for (const recipe of recipes) {
    const desiredSlugs = inferCuisineSlugs(recipe);

    if (desiredSlugs.length === 0) {
      skippedNoSignal += 1;
      continue;
    }

    highConfidenceMatches += 1;

    const currentSlugs = recipe.recipeCuisine.map((item) => item.cuisine.slug);
    const currentSlugSet = new Set(currentSlugs);
    const seenCuisineIds = new Set();
    const recipeDuplicateRelationIds = [];

    for (const relation of recipe.recipeCuisine) {
      if (seenCuisineIds.has(relation.cuisineId)) {
        recipeDuplicateRelationIds.push(relation.id);
      }
      seenCuisineIds.add(relation.cuisineId);
    }

    duplicateRelationIds.push(...recipeDuplicateRelationIds);

    const addSlugs = desiredSlugs.filter((slug) => !currentSlugSet.has(slug));
    const removeRelations = recipe.recipeCuisine.filter(
      (item) =>
        managedCuisineSlugs.has(item.cuisine.slug) &&
        !desiredSlugs.includes(item.cuisine.slug),
    );
    const removeSlugs = unique(removeRelations.map((item) => item.cuisine.slug));

    if (
      addSlugs.length === 0 &&
      removeRelations.length === 0 &&
      recipeDuplicateRelationIds.length === 0
    ) {
      unchangedMatches += 1;
      continue;
    }

    changes.push({
      recipe,
      desiredSlugs,
      addSlugs,
      removeRelations,
      sample: compactRecipe(recipe, desiredSlugs, addSlugs, removeSlugs),
    });
  }

  if (apply) {
    for (const change of changes) {
      await db.$transaction(async (tx) => {
        const removeIds = change.removeRelations.map((relation) => relation.id);

        if (removeIds.length > 0) {
          await tx.recipeCuisines.deleteMany({ where: { id: { in: removeIds } } });
        }

        for (const slug of change.addSlugs) {
          const cuisine = cuisineBySlug.get(slug);

          if (!cuisine) continue;

          const existing = await tx.recipeCuisines.findFirst({
            where: { recipeId: change.recipe.id, cuisineId: cuisine.id },
            select: { id: true },
          });

          if (!existing) {
            await tx.recipeCuisines.create({
              data: { recipeId: change.recipe.id, cuisineId: cuisine.id },
            });
          }
        }
      });
    }

    if (duplicateRelationIds.length > 0) {
      await db.recipeCuisines.deleteMany({
        where: { id: { in: duplicateRelationIds } },
      });
    }
  }

  const addSummary = {};
  const removeSummary = {};

  for (const change of changes) {
    for (const slug of change.addSlugs) {
      addSummary[slug] = (addSummary[slug] || 0) + 1;
    }
    for (const relation of change.removeRelations) {
      const slug = relation.cuisine.slug;
      removeSummary[slug] = (removeSummary[slug] || 0) + 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        scope: publishedOnly ? "published recipes" : "all recipes",
        scannedRecipes: recipes.length,
        highConfidenceMatches,
        unchangedMatches,
        skippedNoSignal,
        recipesToUpdate: changes.length,
        duplicateCuisineLinksToRemove: duplicateRelationIds.length,
        addSummary,
        removeSummary,
        samples: changes.slice(0, 30).map((change) => change.sample),
        removalSamples: changes
          .filter((change) => change.removeRelations.length > 0)
          .slice(0, 30)
          .map((change) => change.sample),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("[repair-recipe-cuisine-tags]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
