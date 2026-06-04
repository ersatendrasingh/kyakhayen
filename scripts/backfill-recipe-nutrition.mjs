import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const SOURCE = "ESTIMATED_REVIEW_2026_06_03";

const ENV_FILES = ["/opt/kasa/kyakhayen/.env", ".env.local", ".env"];

for (const file of ENV_FILES) {
  if (!fs.existsSync(file)) continue;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const db = new PrismaClient();

const NUTRITION_FIELDS = [
  "calories",
  "carbohydrate",
  "totalFat",
  "dietaryFiber",
  "protein",
  "vitaminA",
  "ascorbicAcids",
  "vitaminD",
  "tocopherolEquivalent",
  "vitaminK",
  "thiamine",
  "riboflavin",
  "totalB6",
  "folates",
  "calcium",
  "iron",
  "phosphorus",
  "potassium",
  "sodium",
  "zinc",
];

const EMPTY_NUTRITION = Object.fromEntries(NUTRITION_FIELDS.map((field) => [field, 0]));

const profile = (values, source = SOURCE) => ({
  ...EMPTY_NUTRITION,
  ...values,
  nutritionBasisGrams: 100,
  nutritionSource: source,
});

const COPY_NUTRITION_FROM_SLUG = {
  "tomato-tamatar": "tomato-ripe-local",
  "potato-aloo": "potato-brown-skin-big",
  "carrot-gajar": "carrot-orange",
  "chana-dal": "bengal-gram-dal",
  "sattu-roasted-gram-flour": "sattu",
  "colocasia-leaves-arbi-patta": "colocasia-leaves-green",
  celery: "celery-raw",
  "chicken-stock": "soup-stock-chicken-home-prepared",
  "cucumber-raw": "cucumber-green-elongate",
  "okra-bhindi": "okra-raw",
  "prawns-kolambi": "prawns-big",
  "pumpkin-kaddu": "pumpkin-raw",
};

const NUTRITION_OVERRIDES = {
  "garam-masala": profile({
    calories: 379,
    carbohydrate: 45,
    totalFat: 15,
    dietaryFiber: 20,
    protein: 14,
    calcium: 800,
    iron: 20,
    phosphorus: 350,
    potassium: 1200,
    sodium: 80,
    zinc: 4,
  }),
  "plain-curd-dahi": profile({
    calories: 61,
    carbohydrate: 4.7,
    totalFat: 3.3,
    dietaryFiber: 0,
    protein: 3.5,
    vitaminA: 27,
    vitaminD: 0.1,
    riboflavin: 0.14,
    totalB6: 0.03,
    folates: 7,
    calcium: 121,
    iron: 0.1,
    phosphorus: 95,
    potassium: 155,
    sodium: 46,
    zinc: 0.6,
  }),
  "white-sugar": profile({
    calories: 387,
    carbohydrate: 100,
    sodium: 1,
  }),
  "sugar-white": profile({
    calories: 387,
    carbohydrate: 100,
    sodium: 1,
  }),
  "all-purpose-flour-maida": profile({
    calories: 364,
    carbohydrate: 76.3,
    totalFat: 1,
    dietaryFiber: 2.7,
    protein: 10.3,
    thiamine: 0.79,
    riboflavin: 0.49,
    totalB6: 0.04,
    folates: 183,
    calcium: 15,
    iron: 4.6,
    phosphorus: 108,
    potassium: 107,
    sodium: 2,
    zinc: 0.7,
  }),
  "bengal-gram-flour-besan": profile({
    calories: 387,
    carbohydrate: 57.8,
    totalFat: 6.7,
    dietaryFiber: 10.8,
    protein: 22.4,
    thiamine: 0.49,
    riboflavin: 0.06,
    totalB6: 0.49,
    folates: 437,
    calcium: 45,
    iron: 4.9,
    phosphorus: 318,
    potassium: 846,
    sodium: 64,
    zinc: 2.8,
  }),
  "fresh-cream": profile({
    calories: 340,
    carbohydrate: 2.8,
    totalFat: 36,
    dietaryFiber: 0,
    protein: 2.1,
    vitaminA: 390,
    vitaminD: 1.5,
    tocopherolEquivalent: 0.9,
    vitaminK: 3.2,
    riboflavin: 0.1,
    folates: 4,
    calcium: 66,
    phosphorus: 60,
    potassium: 75,
    sodium: 38,
    zinc: 0.3,
  }),
  "dried-fenugreek-leaves-kasuri-methi": profile({
    calories: 323,
    carbohydrate: 58,
    totalFat: 6.4,
    dietaryFiber: 25,
    protein: 23,
    vitaminA: 520,
    ascorbicAcids: 43,
    calcium: 395,
    iron: 17,
    phosphorus: 300,
    potassium: 770,
    sodium: 67,
    zinc: 2.5,
  }),
  "black-pepper-powder": profile({
    calories: 251,
    carbohydrate: 64,
    totalFat: 3.3,
    dietaryFiber: 25.3,
    protein: 10.4,
    vitaminK: 164,
    calcium: 443,
    iron: 9.7,
    phosphorus: 158,
    potassium: 1329,
    sodium: 20,
    zinc: 1.2,
  }),
  "black-salt": profile({
    calories: 0,
    sodium: 38000,
    iron: 0.3,
  }),
  "light-soy-sauce": profile({
    calories: 53,
    carbohydrate: 4.9,
    totalFat: 0.6,
    dietaryFiber: 0.8,
    protein: 8.1,
    calcium: 33,
    iron: 1.5,
    phosphorus: 166,
    potassium: 435,
    sodium: 5493,
    zinc: 0.9,
  }),
  "dark-soy-sauce": profile({
    calories: 60,
    carbohydrate: 7,
    totalFat: 0.5,
    dietaryFiber: 0.8,
    protein: 7,
    calcium: 33,
    iron: 1.5,
    phosphorus: 166,
    potassium: 435,
    sodium: 5600,
    zinc: 0.9,
  }),
  "white-vinegar": profile({
    calories: 18,
    carbohydrate: 0.04,
    potassium: 2,
    sodium: 2,
  }),
  "full-cream-milk": profile({
    calories: 61,
    carbohydrate: 4.8,
    totalFat: 3.3,
    dietaryFiber: 0,
    protein: 3.2,
    vitaminA: 46,
    vitaminD: 0.1,
    riboflavin: 0.18,
    totalB6: 0.04,
    folates: 5,
    calcium: 113,
    iron: 0.03,
    phosphorus: 84,
    potassium: 132,
    sodium: 43,
    zinc: 0.4,
  }),
  "khoya-mawa": profile({
    calories: 315,
    carbohydrate: 22,
    totalFat: 22,
    protein: 17,
    vitaminA: 230,
    vitaminD: 0.7,
    calcium: 650,
    phosphorus: 500,
    potassium: 400,
    sodium: 170,
    zinc: 2.2,
  }),
  "fresh-chhena": profile({
    calories: 265,
    carbohydrate: 6,
    totalFat: 20,
    protein: 15,
    vitaminA: 210,
    vitaminD: 0.4,
    calcium: 480,
    phosphorus: 350,
    potassium: 140,
    sodium: 25,
    zinc: 1.5,
  }),
  "sweetened-condensed-milk": profile({
    calories: 321,
    carbohydrate: 54.4,
    totalFat: 8.7,
    protein: 7.9,
    vitaminA: 74,
    calcium: 284,
    iron: 0.2,
    phosphorus: 253,
    potassium: 371,
    sodium: 127,
    zinc: 0.9,
  }),
  "milk-powder": profile({
    calories: 496,
    carbohydrate: 38,
    totalFat: 27,
    protein: 26,
    vitaminA: 290,
    vitaminD: 2,
    calcium: 912,
    phosphorus: 776,
    potassium: 1330,
    sodium: 371,
    zinc: 3.4,
  }),
  rabri: profile({
    calories: 220,
    carbohydrate: 24,
    totalFat: 11,
    protein: 8,
    vitaminA: 120,
    calcium: 260,
    phosphorus: 190,
    potassium: 210,
    sodium: 85,
    zinc: 1,
  }),
  "jaggery-cane": profile({
    calories: 383,
    carbohydrate: 98,
    calcium: 80,
    iron: 11,
    potassium: 1056,
    sodium: 30,
  }),
  "red-chilli-sauce": profile({
    calories: 110,
    carbohydrate: 26,
    totalFat: 0.4,
    dietaryFiber: 1,
    protein: 1.5,
    vitaminA: 65,
    ascorbicAcids: 10,
    potassium: 180,
    sodium: 1200,
  }),
  "green-chutney": profile({
    calories: 70,
    carbohydrate: 10,
    totalFat: 3,
    dietaryFiber: 4,
    protein: 3,
    vitaminA: 220,
    ascorbicAcids: 35,
    vitaminK: 240,
    calcium: 80,
    iron: 3,
    potassium: 300,
    sodium: 600,
  }),
  "tamarind-chutney": profile({
    calories: 150,
    carbohydrate: 38,
    totalFat: 0.2,
    dietaryFiber: 2,
    protein: 1,
    calcium: 35,
    iron: 1.5,
    potassium: 250,
    sodium: 450,
  }),
  "tamarind-pulp": profile({
    calories: 239,
    carbohydrate: 62.5,
    totalFat: 0.6,
    dietaryFiber: 5.1,
    protein: 2.8,
    calcium: 74,
    iron: 2.8,
    phosphorus: 113,
    potassium: 628,
    sodium: 28,
    zinc: 0.1,
  }),
  "sunflower-oil": profile({
    calories: 884,
    totalFat: 100,
    tocopherolEquivalent: 41,
    vitaminK: 5.4,
  }),
  "sesame-oil": profile({
    calories: 884,
    totalFat: 100,
    tocopherolEquivalent: 1.4,
    vitaminK: 13.6,
  }),
  "baking-powder": profile({
    calories: 53,
    carbohydrate: 27.7,
    calcium: 5876,
    phosphorus: 8433,
    sodium: 10600,
  }),
  "leavening-agents-baking-soda": profile({
    sodium: 27360,
  }),
  "chicken-pieces": profile({
    calories: 120,
    totalFat: 2.6,
    protein: 22.5,
    thiamine: 0.08,
    riboflavin: 0.12,
    totalB6: 0.6,
    folates: 4,
    calcium: 11,
    iron: 0.7,
    phosphorus: 190,
    potassium: 256,
    sodium: 65,
    zinc: 1,
  }),
  "boneless-chicken": profile({
    calories: 120,
    totalFat: 2.6,
    protein: 22.5,
    thiamine: 0.08,
    riboflavin: 0.12,
    totalB6: 0.6,
    folates: 4,
    calcium: 11,
    iron: 0.7,
    phosphorus: 190,
    potassium: 256,
    sodium: 65,
    zinc: 1,
  }),
  "chicken-mince": profile({
    calories: 143,
    totalFat: 8,
    protein: 17.5,
    calcium: 12,
    iron: 0.8,
    phosphorus: 178,
    potassium: 220,
    sodium: 75,
    zinc: 1.2,
  }),
  "chicken-wings": profile({
    calories: 203,
    totalFat: 13.2,
    protein: 18.3,
    calcium: 11,
    iron: 1,
    phosphorus: 155,
    potassium: 210,
    sodium: 82,
    zinc: 1.3,
  }),
  "mutton-pieces": profile({
    calories: 194,
    totalFat: 13,
    protein: 18,
    riboflavin: 0.2,
    totalB6: 0.2,
    calcium: 10,
    iron: 2,
    phosphorus: 180,
    potassium: 270,
    sodium: 70,
    zinc: 4,
  }),
  "mutton-mince": profile({
    calories: 220,
    totalFat: 16,
    protein: 17,
    riboflavin: 0.2,
    totalB6: 0.2,
    calcium: 10,
    iron: 2,
    phosphorus: 180,
    potassium: 260,
    sodium: 75,
    zinc: 4,
  }),
  "fish-fillets": profile({
    calories: 96,
    totalFat: 1.7,
    protein: 20,
    vitaminD: 1,
    calcium: 12,
    iron: 0.3,
    phosphorus: 200,
    potassium: 300,
    sodium: 60,
    zinc: 0.5,
  }),
  "rohu-fish-pieces": profile({
    calories: 97,
    totalFat: 1.8,
    protein: 19,
    vitaminD: 1,
    calcium: 40,
    iron: 1,
    phosphorus: 220,
    potassium: 300,
    sodium: 60,
    zinc: 0.6,
  }),
  "bombil-fish": profile({
    calories: 90,
    totalFat: 1.5,
    protein: 18,
    calcium: 80,
    iron: 1.2,
    phosphorus: 210,
    potassium: 250,
    sodium: 85,
    zinc: 0.7,
  }),
  "coconut-milk": profile({
    calories: 197,
    carbohydrate: 2.8,
    totalFat: 21.3,
    dietaryFiber: 0,
    protein: 2,
    calcium: 18,
    iron: 3.3,
    phosphorus: 96,
    potassium: 220,
    sodium: 13,
    zinc: 0.6,
  }),
  "vegetable-stock": profile({
    calories: 12,
    carbohydrate: 2,
    protein: 0.5,
    calcium: 8,
    iron: 0.2,
    potassium: 70,
    sodium: 250,
  }),
};

const CATEGORY_PROFILES = [
  [
    /masala|powder|chilli|pepper|ajwain|cinnamon|nutmeg|mace|kachri/,
    profile({
      calories: 300,
      carbohydrate: 50,
      totalFat: 8,
      dietaryFiber: 20,
      protein: 10,
      vitaminA: 150,
      ascorbicAcids: 5,
      calcium: 250,
      iron: 10,
      phosphorus: 250,
      potassium: 900,
      sodium: 90,
      zinc: 2,
    }),
  ],
  [
    /salt/,
    profile({
      sodium: 38000,
    }),
  ],
  [
    /flour|bhajani/,
    profile({
      calories: 360,
      carbohydrate: 72,
      totalFat: 3,
      dietaryFiber: 8,
      protein: 11,
      thiamine: 0.35,
      riboflavin: 0.12,
      totalB6: 0.2,
      folates: 40,
      calcium: 30,
      iron: 3.5,
      phosphorus: 280,
      potassium: 350,
      sodium: 5,
      zinc: 2,
    }),
  ],
  [
    /rice|poha|chura|sabudana|vermicelli|noodles|pav|bread|wrapper|sheet/,
    profile({
      calories: 350,
      carbohydrate: 76,
      totalFat: 1,
      dietaryFiber: 2,
      protein: 7,
      thiamine: 0.2,
      riboflavin: 0.05,
      totalB6: 0.1,
      folates: 20,
      calcium: 20,
      iron: 1.2,
      phosphorus: 100,
      potassium: 100,
      sodium: 10,
      zinc: 1,
    }),
  ],
  [
    /dal|beans|peas|matki|mangodi/,
    profile({
      calories: 340,
      carbohydrate: 60,
      totalFat: 2,
      dietaryFiber: 16,
      protein: 22,
      thiamine: 0.45,
      riboflavin: 0.15,
      totalB6: 0.35,
      folates: 200,
      calcium: 60,
      iron: 5,
      phosphorus: 320,
      potassium: 900,
      sodium: 15,
      zinc: 3,
    }),
  ],
  [
    /peanut|pistachio|seed/,
    profile({
      calories: 570,
      carbohydrate: 18,
      totalFat: 48,
      dietaryFiber: 9,
      protein: 22,
      tocopherolEquivalent: 8,
      thiamine: 0.6,
      riboflavin: 0.15,
      totalB6: 0.3,
      folates: 100,
      calcium: 120,
      iron: 4,
      phosphorus: 450,
      potassium: 700,
      sodium: 8,
      zinc: 3.5,
    }),
  ],
  [
    /sauce|chutney|stock/,
    profile({
      calories: 80,
      carbohydrate: 15,
      totalFat: 1.5,
      dietaryFiber: 2,
      protein: 2,
      ascorbicAcids: 5,
      calcium: 25,
      iron: 1,
      potassium: 180,
      sodium: 700,
    }),
  ],
  [
    /chicken|mutton|fish|prawn/,
    profile({
      calories: 140,
      totalFat: 5,
      protein: 20,
      vitaminD: 0.5,
      calcium: 15,
      iron: 1,
      phosphorus: 200,
      potassium: 260,
      sodium: 70,
      zinc: 1.5,
    }),
  ],
  [
    /milk|curd|cream|khoya|mawa|chhena|rabri/,
    profile({
      calories: 120,
      carbohydrate: 8,
      totalFat: 7,
      protein: 6,
      vitaminA: 90,
      vitaminD: 0.4,
      calcium: 220,
      phosphorus: 170,
      potassium: 180,
      sodium: 70,
      zinc: 0.8,
    }),
  ],
  [
    /sugar|jaggery|condensed/,
    profile({
      calories: 380,
      carbohydrate: 96,
      potassium: 100,
      sodium: 20,
    }),
  ],
  [
    /oil|ghee/,
    profile({
      calories: 884,
      totalFat: 100,
      tocopherolEquivalent: 2,
      vitaminK: 8,
    }),
  ],
  [
    /banana|mango|dates|raisins|lemon|kokum|ker|sangri/,
    profile({
      calories: 90,
      carbohydrate: 22,
      totalFat: 0.5,
      dietaryFiber: 3,
      protein: 1,
      vitaminA: 20,
      ascorbicAcids: 18,
      totalB6: 0.2,
      folates: 20,
      calcium: 15,
      iron: 0.5,
      phosphorus: 25,
      potassium: 250,
      sodium: 2,
      zinc: 0.2,
    }),
  ],
  [
    /capsicum|cabbage|onion|vegetable|eggplant|mushroom|gourd|okra|pumpkin|cucumber|chilli|corn|celery|tulsi/,
    profile({
      calories: 35,
      carbohydrate: 7,
      totalFat: 0.3,
      dietaryFiber: 3,
      protein: 2,
      vitaminA: 120,
      ascorbicAcids: 35,
      vitaminK: 40,
      thiamine: 0.06,
      riboflavin: 0.06,
      totalB6: 0.15,
      folates: 35,
      calcium: 35,
      iron: 1,
      phosphorus: 45,
      potassium: 250,
      sodium: 12,
      zinc: 0.4,
    }),
  ],
  [
    /sev|farsan|boondi|papdi|papad/,
    profile({
      calories: 500,
      carbohydrate: 55,
      totalFat: 28,
      dietaryFiber: 5,
      protein: 10,
      calcium: 60,
      iron: 3,
      phosphorus: 180,
      potassium: 300,
      sodium: 900,
      zinc: 1.5,
    }),
  ],
  [
    /silver|varak/,
    profile({}),
  ],
];

const MEASUREMENT_OVERRIDES = {
  "garam-masala:tsp": 2,
  "tomato-tamatar:no": 100,
  "tomatoes-red-ripe-raw-year-round-average:no": 123,
  "plain-curd-dahi:cup": 245,
  "plain-curd-dahi:tbsp": 15,
  "white-sugar:cup": 200,
  "white-sugar:tsp": 4,
  "sugar-white:tbsp": 12.5,
  "all-purpose-flour-maida:cup": 125,
  "all-purpose-flour-maida:tbsp": 8,
  "dried-fenugreek-leaves-kasuri-methi:tsp": 0.5,
  "potato-aloo:no": 150,
  "fresh-cream:tbsp": 15,
  "fresh-cream:cup": 240,
  "bengal-gram-flour-besan:cup": 92,
  "bengal-gram-flour-besan:tbsp": 5.75,
  "black-pepper-powder:tsp": 2.3,
  "light-soy-sauce:tbsp": 16,
  "dark-soy-sauce:tsp": 5.3,
  "white-vinegar:tbsp": 15,
  "spring-onion:cup": 100,
  "capsicum-shimla-mirch:cup": 92,
  "capsicum-shimla-mirch:no": 120,
  "jaggery-cane:cup": 200,
  "baking-powder:tsp": 4,
  "carrot-gajar:cup": 110,
  "carrot-gajar:no": 60,
  "sunflower-oil:as-required": 0,
  "kashmiri-red-chilli-powder:tsp": 2.7,
  "mathania-red-chilli-powder:tbsp": 8.1,
  "cornflour:tbsp": 8,
  "full-cream-milk:l": 1000,
  "full-cream-milk:cup": 244,
  "full-cream-milk:tbsp": 15,
  "green-cabbage:cup": 89,
  "red-chilli-sauce:tbsp": 15,
  "ghee:cup": 220,
  "khoya-mawa:cup": 205,
  "black-salt:tsp": 6,
  "chana-dal:cup": 200,
  "tandoori-masala:tsp": 2,
  "cumin-powder:tsp": 2.1,
  "meat-masala:tsp": 2,
  "toor-dal:cup": 200,
  "chaat-masala:tsp": 2,
  "sesame-oil:tsp": 4.5,
  "eggplant-baingan:no": 300,
  "green-chutney:cup": 240,
  "nigella-seeds-kalonji:tsp": 2.1,
  "sev:cup": 65,
  "leavening-agents-baking-soda:pinch": 0.4,
  "peas-green-raw:cup": 145,
  "poppy-seeds:tbsp": 9,
  "roasted-peanuts:cup": 146,
  "sattu-roasted-gram-flour:cup": 120,
  "tamarind-chutney:cup": 320,
  "chole-masala:tsp": 2,
  "mixed-vegetables:cup": 150,
  "tamarind-pulp:tbsp": 15,
  "vegetable-stock:cup": 240,
  "ambemohar-rice:cup": 185,
  "edible-silver-leaf-varak:as-required": 0,
  "edible-silver-leaf-varak:pc": 0.01,
  "foxnut:cup": 25,
  "jowar-flour:cup": 120,
  "kitchen-king-masala:tsp": 2,
  "mustard-paste:tbsp": 15,
  "rice-flour:cup": 158,
  "rice-flour:tbsp": 10,
  "rice-flour:tsp": 3.3,
  "white-peas:cup": 200,
  "chicken-masala:tsp": 2,
  "coconut-milk:cup": 240,
  "cooked-rice:cup": 158,
  "ladi-pav:no": 50,
  "milk-powder:cup": 100,
  "momo-wrappers:no": 10,
  "papdi:cup": 60,
  "pistachio-nuts:cup": 123,
  "puffed-rice-murmura:cup": 14,
  "rabri:cup": 240,
  "sabudana-sago-pearls:cup": 150,
  "seeds-sesame-seeds-whole-dried:cup": 144,
  "sweetened-condensed-milk:cup": 306,
  "urad-dal-split:cup": 200,
  "whole-black-gram-urad:cup": 200,
  "dried-red-chillies:no": 0.5,
  "flattened-rice-chura:cup": 80,
  "flattened-rice-poha:cup": 80,
  "kokum:pc": 2,
  "kolhapuri-masala:tsp": 2,
  "malvani-masala:tsp": 2,
  "masoor-dal:cup": 200,
  "rajma-red-kidney-beans:cup": 184,
  "roasted-peanut-powder:cup": 120,
  "schezwan-sauce:tbsp": 17,
  "sprouted-matki:cup": 104,
  "sun-dried-badi:cup": 100,
  "wheat-vermicelli-roasted:cup": 100,
  "white-bread-slices:slices": 25,
  "ajwain:tsp": 2,
  "bajra-flour:cup": 120,
  "banana:no": 118,
  "celery:cup": 101,
  "chakli-bhajani-flour:cup": 120,
  "chicken-wings:no": 85,
  "cinnamon:pinch": 0.3,
  "colocasia-leaves-arbi-patta:leaves": 20,
  "colocasia-leaves-arbi-patta:no": 20,
  "cucumber-raw:slices": 7,
  "dates-dry-dark-brown:cup": 147,
  "dried-pomegranate-seeds-powder:tsp": 2,
  "dry-garlic-chutney:cup": 100,
  "egg-whole-raw-fresh:no": 50,
  "kachri-powder:tsp": 2,
  "ker-berries:cup": 150,
  "kombdi-vade-flour:cup": 120,
  "large-green-chillies:no": 15,
  "lemon:pc": 58,
  "mace:pc": 1,
  "mango-pulp:cup": 250,
  "mangodi-moong-dal-nuggets:cup": 160,
  "melon-seeds:tbsp": 10,
  "mixed-farsan:cup": 60,
  "nihari-masala:tsp": 2,
  "nutmeg-ground:pinch": 0.3,
  "papad:no": 10,
  "pav-bhaji-masala:tsp": 2,
  "peas-dry:cup": 200,
  "pointed-gourd-parwal:no": 35,
  "rabodi-dried-buttermilk-wafers:cup": 80,
  "raisins-dried-black:cup": 145,
  "raw-mango:cup": 165,
  "sangri-beans:cup": 150,
  "saoji-masala:tsp": 2,
  "spring-roll-sheets:no": 20,
  "sweet-corn-kernels:cup": 165,
  "thalipeeth-bhajani-flour:cup": 120,
  "tiny-boondi:cup": 90,
  "tulsi-leaves:pc": 0.5,
  "white-pepper-powder:tsp": 2.3,
  "dried-pomegranate-seeds-powder:tsp": 2,
};

function textFor(ingredient) {
  return `${ingredient.slug ?? ""} ${ingredient.name ?? ""}`.toLowerCase();
}

function hasCompleteNutrition(ingredient) {
  return NUTRITION_FIELDS.every((field) => ingredient[field] !== null);
}

function copyNutritionData(source) {
  return {
    ...Object.fromEntries(NUTRITION_FIELDS.map((field) => [field, source[field] ?? 0])),
    nutritionBasisGrams: source.nutritionBasisGrams || 100,
    nutritionSource: `COPIED_FROM:${source.slug}:${source.nutritionSource ?? "CATALOG"}`,
  };
}

function estimatedNutritionFor(ingredient) {
  if (NUTRITION_OVERRIDES[ingredient.slug]) return NUTRITION_OVERRIDES[ingredient.slug];

  const text = textFor(ingredient);
  const category = CATEGORY_PROFILES.find(([pattern]) => pattern.test(text));
  if (category) return category[1];

  return profile({
    calories: 45,
    carbohydrate: 9,
    totalFat: 0.5,
    dietaryFiber: 2,
    protein: 2,
    vitaminA: 50,
    ascorbicAcids: 10,
    calcium: 25,
    iron: 1,
    phosphorus: 40,
    potassium: 180,
    sodium: 15,
    zinc: 0.4,
  });
}

function measurementFor(ingredient, unit) {
  const key = `${ingredient.slug}:${unit.shortName}`;
  if (Object.prototype.hasOwnProperty.call(MEASUREMENT_OVERRIDES, key)) {
    return MEASUREMENT_OVERRIDES[key];
  }

  const text = textFor(ingredient);
  const unitName = (unit.shortName ?? "").toLowerCase();

  if (unitName === "as-required") return 0;
  if (unitName === "pinch") return 0.35;
  if (unitName === "tsp") {
    if (/oil|sauce|vinegar|stock/.test(text)) return 5;
    if (/sugar/.test(text)) return 4;
    return 2;
  }
  if (unitName === "tbsp") {
    if (/oil|sauce|vinegar|stock|milk|curd|cream|paste|pulp/.test(text)) return 15;
    if (/seed|peanut/.test(text)) return 9;
    return 8;
  }
  if (unitName === "cup") {
    if (/milk|curd|cream|stock|sauce|chutney|pulp|rabri|coconut/.test(text)) return 240;
    if (/flour|powder|sattu/.test(text)) return 120;
    if (/dal|beans|peas|rice|sabudana|noodles|vermicelli/.test(text)) return 180;
    if (/peanut|pistachio|seed/.test(text)) return 140;
    if (/puffed/.test(text)) return 15;
    if (/sev|farsan|papdi|boondi/.test(text)) return 70;
    return 120;
  }
  if (unitName === "l") return 1000;
  if (unitName === "no") {
    if (/tomato/.test(text)) return 100;
    if (/potato/.test(text)) return 150;
    if (/capsicum/.test(text)) return 120;
    if (/banana/.test(text)) return 118;
    if (/egg/.test(text)) return 50;
    if (/chilli/.test(text)) return 15;
    if (/wing/.test(text)) return 85;
    return 50;
  }
  if (unitName === "pc" || unitName === "piece") {
    if (/silver|varak/.test(text)) return 0.01;
    if (/lemon/.test(text)) return 58;
    if (/kokum/.test(text)) return 2;
    return 5;
  }
  if (unitName === "slices") return 25;
  if (unitName === "leaves") return 1;

  return null;
}

async function loadPublishedRecipes() {
  return db.recipes.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      recipeIngredients: {
        select: {
          quantity: true,
          ingredient: {
            select: Object.fromEntries(
              [
                "id",
                "name",
                "slug",
                "isPublished",
                "nutritionSource",
                "nutritionBasisGrams",
                ...NUTRITION_FIELDS,
              ].map((field) => [field, true]),
            ),
          },
          unit: { select: { id: true, title: true, shortName: true } },
        },
      },
    },
  });
}

async function audit() {
  const recipes = await loadPublishedRecipes();
  const conversions = await db.ingredientUnitMeasurements.findMany({
    select: { ingredientId: true, unitId: true, values: true },
  });
  const conversionMap = new Map(
    conversions.map((conversion) => [
      `${conversion.ingredientId}:${conversion.unitId}`,
      conversion.values,
    ]),
  );

  const missingRecipes = new Set();
  const missingConversionPairs = new Map();
  const missingNutritionIngredients = new Map();

  for (const recipe of recipes) {
    for (const recipeIngredient of recipe.recipeIngredients) {
      const { ingredient, unit } = recipeIngredient;
      const unitShortName = (unit.shortName ?? "").toLowerCase();
      const hasGramUnit = ["g", "gm"].includes(unitShortName);
      const hasConversion = hasGramUnit || conversionMap.has(`${ingredient.id}:${unit.id}`);

      if (!hasConversion || !ingredient.isPublished || !hasCompleteNutrition(ingredient)) {
        missingRecipes.add(recipe.id);
      }

      if (!hasConversion) {
        const key = `${ingredient.slug}:${unit.shortName}`;
        const item = missingConversionPairs.get(key) ?? {
          ingredient: ingredient.name,
          slug: ingredient.slug,
          unit: unit.title,
          shortName: unit.shortName,
          recipes: new Set(),
        };
        item.recipes.add(recipe.id);
        missingConversionPairs.set(key, item);
      }

      if (!hasCompleteNutrition(ingredient)) {
        const item = missingNutritionIngredients.get(ingredient.slug) ?? {
          name: ingredient.name,
          slug: ingredient.slug,
          recipes: new Set(),
        };
        item.recipes.add(recipe.id);
        missingNutritionIngredients.set(ingredient.slug, item);
      }
    }
  }

  return {
    publishedRecipes: recipes.length,
    recipesMissingNutrition: missingRecipes.size,
    recipesNutritionReady: recipes.length - missingRecipes.size,
    missingConversionPairs: missingConversionPairs.size,
    ingredientsWithMissingNutrition: missingNutritionIngredients.size,
    topMissingConversions: [...missingConversionPairs.values()]
      .map((item) => ({ ...item, recipes: item.recipes.size }))
      .sort((a, b) => b.recipes - a.recipes)
      .slice(0, 20),
    topMissingNutrition: [...missingNutritionIngredients.values()]
      .map((item) => ({ ...item, recipes: item.recipes.size }))
      .sort((a, b) => b.recipes - a.recipes)
      .slice(0, 20),
  };
}

async function main() {
  const before = await audit();
  const recipes = await loadPublishedRecipes();
  const ingredientById = new Map();
  const missingPairs = new Map();
  const existingConversions = await db.ingredientUnitMeasurements.findMany({
    select: { ingredientId: true, unitId: true },
  });
  const conversionKeys = new Set(
    existingConversions.map((conversion) => `${conversion.ingredientId}:${conversion.unitId}`),
  );

  for (const recipe of recipes) {
    for (const recipeIngredient of recipe.recipeIngredients) {
      ingredientById.set(recipeIngredient.ingredient.id, recipeIngredient.ingredient);

      const shortName = (recipeIngredient.unit.shortName ?? "").toLowerCase();
      if (
        ["g", "gm"].includes(shortName) ||
        conversionKeys.has(`${recipeIngredient.ingredient.id}:${recipeIngredient.unit.id}`)
      ) {
        continue;
      }

      const key = `${recipeIngredient.ingredient.id}:${recipeIngredient.unit.id}`;
      missingPairs.set(key, {
        ingredient: recipeIngredient.ingredient,
        unit: recipeIngredient.unit,
      });
    }
  }

  const catalogMissingIngredients = await db.ingredients.findMany({
    where: {
      OR: NUTRITION_FIELDS.map((field) => ({ [field]: null })),
    },
    select: Object.fromEntries(
      [
        "id",
        "name",
        "slug",
        "isPublished",
        "nutritionSource",
        "nutritionBasisGrams",
        ...NUTRITION_FIELDS,
      ].map((field) => [field, true]),
    ),
  });

  for (const ingredient of catalogMissingIngredients) {
    ingredientById.set(ingredient.id, ingredient);
  }

  const missingNutritionIngredients = [...ingredientById.values()].filter(
    (ingredient) => !hasCompleteNutrition(ingredient),
  );
  const sourceSlugs = [
    ...new Set(Object.values(COPY_NUTRITION_FROM_SLUG).filter(Boolean)),
  ];
  const sourceIngredients = await db.ingredients.findMany({
    where: { slug: { in: sourceSlugs } },
    select: Object.fromEntries(
      ["slug", "nutritionSource", "nutritionBasisGrams", ...NUTRITION_FIELDS].map((field) => [
        field,
        true,
      ]),
    ),
  });
  const sourceBySlug = new Map(sourceIngredients.map((ingredient) => [ingredient.slug, ingredient]));

  const plannedNutritionUpdates = [];
  const missingProfiles = [];

  for (const ingredient of missingNutritionIngredients) {
    const sourceSlug = COPY_NUTRITION_FROM_SLUG[ingredient.slug];
    const sourceIngredient = sourceSlug ? sourceBySlug.get(sourceSlug) : null;
    const data =
      sourceIngredient && hasCompleteNutrition(sourceIngredient)
        ? copyNutritionData(sourceIngredient)
        : estimatedNutritionFor(ingredient);

    if (!data) {
      missingProfiles.push({ name: ingredient.name, slug: ingredient.slug });
      continue;
    }

    plannedNutritionUpdates.push({ ingredient, data });
  }

  const plannedMeasurementUpdates = [];
  const missingMeasurements = [];

  for (const { ingredient, unit } of missingPairs.values()) {
    const grams = measurementFor(ingredient, unit);
    if (grams === null || grams === undefined || !Number.isFinite(grams) || grams < 0) {
      missingMeasurements.push({
        ingredient: ingredient.name,
        slug: ingredient.slug,
        unit: unit.title,
        shortName: unit.shortName,
      });
      continue;
    }

    plannedMeasurementUpdates.push({ ingredient, unit, grams });
  }

  if (APPLY && (missingProfiles.length || missingMeasurements.length)) {
    throw new Error("Backfill has unresolved nutrition profiles or measurements.");
  }

  if (APPLY) {
    for (const { ingredient, data } of plannedNutritionUpdates) {
      await db.ingredients.update({
        where: { id: ingredient.id },
        data,
      });
    }

    for (const { ingredient, unit, grams } of plannedMeasurementUpdates) {
      await db.ingredientUnitMeasurements.upsert({
        where: {
          ingredientId_unitId: {
            ingredientId: ingredient.id,
            unitId: unit.id,
          },
        },
        update: { values: grams },
        create: {
          ingredientId: ingredient.id,
          unitId: unit.id,
          values: grams,
        },
      });
    }
  }

  const after = APPLY ? await audit() : null;

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? "apply" : "dry-run",
        before,
        plannedNutritionUpdates: plannedNutritionUpdates.length,
        plannedMeasurementUpdates: plannedMeasurementUpdates.length,
        missingProfiles,
        missingMeasurements,
        after,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
