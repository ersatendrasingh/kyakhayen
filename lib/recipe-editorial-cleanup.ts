export type EditorialRecipeRemoval = {
  sourceId: number;
  keepSourceId: number;
  reason: string;
};

export type EditorialRecipeRename = {
  sourceId: number;
  title: string;
  suppressImage?: boolean;
};

/**
 * Same-name recipes reviewed after the exact source-data duplicate cleanup.
 * Removals are redundant or unusably incomplete records; renames preserve
 * recipes whose ingredient/method differences make them a useful variant.
 */
export const EDITORIAL_RECIPE_REMOVALS: EditorialRecipeRemoval[] = [
  { sourceId: 3315, keepSourceId: 3302, reason: "Duplicate Aam Ras preparation." },
  { sourceId: 3307, keepSourceId: 3293, reason: "Duplicate Baajri Na Dhebra preparation." },
  { sourceId: 3308, keepSourceId: 3293, reason: "Duplicate Baajri Na Dhebra preparation." },
  { sourceId: 2405, keepSourceId: 2406, reason: "Duplicate plain Cucumber Raita preparation." },
  { sourceId: 3306, keepSourceId: 3319, reason: "Duplicate Fajeto preparation." },
  { sourceId: 2416, keepSourceId: 2530, reason: "Duplicate French Onion Soup with shared media." },
  { sourceId: 593, keepSourceId: 594, reason: "Duplicate Fruit Chaat preparation." },
  { sourceId: 2844, keepSourceId: 2691, reason: "Duplicate plain Ginger Tea preparation." },
  { sourceId: 749, keepSourceId: 930, reason: "Duplicate Green Salad preparation." },
  { sourceId: 3311, keepSourceId: 3298, reason: "Duplicate Kathol preparation." },
  { sourceId: 3312, keepSourceId: 3299, reason: "Duplicate Khatta Moong preparation." },
  { sourceId: 406, keepSourceId: 925, reason: "Duplicate single-fruit Kiwi entry." },
  { sourceId: 3316, keepSourceId: 3303, reason: "Duplicate Magas preparation." },
  { sourceId: 2375, keepSourceId: 2370, reason: "Duplicate Multigrain Chapati preparation." },
  { sourceId: 3301, keepSourceId: 3314, reason: "Duplicate Mungdi Khakra preparation." },
  { sourceId: 3265, keepSourceId: 1117, reason: "Incomplete Oats Upma variant without method steps." },
  { sourceId: 3318, keepSourceId: 3305, reason: "Duplicate Panchkutiyu Shaak preparation." },
  { sourceId: 581, keepSourceId: 1231, reason: "Duplicate single-fruit Papaya entry." },
  { sourceId: 2364, keepSourceId: 3260, reason: "Incomplete Roasted Foxnut entry without foxnut method." },
  { sourceId: 1923, keepSourceId: 1753, reason: "Duplicate Steamed Radish Salad preparation." },
  { sourceId: 3300, keepSourceId: 3313, reason: "Duplicate Surti Lacho preparation." },
  { sourceId: 3304, keepSourceId: 3317, reason: "Duplicate Surti Paneer Ghotala preparation." },
  { sourceId: 2890, keepSourceId: 2845, reason: "Duplicate everyday Tea preparation." },
  { sourceId: 2360, keepSourceId: 2119, reason: "Incomplete Tulsi-Cinnamon Infusion Tea entry." },
  { sourceId: 3295, keepSourceId: 3310, reason: "Duplicate Undhiyu preparation." },
  { sourceId: 2397, keepSourceId: 3252, reason: "Incomplete Watermelon entry without ingredient data." },
  { sourceId: 3120, keepSourceId: 3119, reason: "Incomplete Kale Stew variant missing tomato used in its method." },
];

export const EDITORIAL_RECIPE_RENAMES: EditorialRecipeRename[] = [
  { sourceId: 3193, title: "Almond-Crusted Baked Zucchini with Parmesan" },
  { sourceId: 231, title: "Bathua Saag with Onion and Tomato" },
  { sourceId: 2725, title: "Coconut Beans Foogath" },
  { sourceId: 2450, title: "Beetroot Cucumber Salad with Cherry Tomatoes" },
  { sourceId: 255, title: "Tomato Onion Besan Cheela" },
  { sourceId: 3356, title: "Garlic Besan Khichu" },
  { sourceId: 3463, title: "Potato Rice Pudla" },
  { sourceId: 3173, title: "Peanut Cauliflower Stir-Fry" },
  { sourceId: 3142, title: "Spinach Chicken Keema" },
  { sourceId: 2533, title: "Coconut Chicken Stew" },
  { sourceId: 2588, title: "Baby Corn and Bell Pepper Salad" },
  { sourceId: 511, title: "Mint Cucumber Raita" },
  { sourceId: 512, title: "Basil Cucumber Salad" },
  { sourceId: 2543, title: "Ginger Egg Drop Soup with Vegetables" },
  { sourceId: 2906, title: "Clove Ginger Tea" },
  { sourceId: 813, title: "Tomato Spiced Grilled Paneer" },
  { sourceId: 2927, title: "Tempered Gujarati Kadhi with Curry Leaves", suppressImage: true },
  { sourceId: 3076, title: "Mushroom Hot and Sour Chicken Soup" },
  { sourceId: 3309, title: "Sweet Corn Jowar Pancakes" },
  { sourceId: 3017, title: "Blackberry Melon Kale Smoothie" },
  { sourceId: 3280, title: "Spiced Gujarati Lauki Soup" },
  { sourceId: 3217, title: "Leek Greens with Egg, Asparagus and Peas" },
  { sourceId: 1017, title: "Mushroom and Cabbage Vegetable Soup", suppressImage: true },
  { sourceId: 903, title: "Tempered Pink Masoor Dal" },
  { sourceId: 1558, title: "Olive Oil Saute Broccoli, Onion, Beans and Mushrooms" },
  { sourceId: 1506, title: "Black Pepper Saute French Beans" },
  { sourceId: 2417, title: "Vegetable Broth Spinach Soup" },
  { sourceId: 3090, title: "Coconut Strawberry Smoothie with Pumpkin Seeds" },
  { sourceId: 3267, title: "Skimmed Milk Strawberry Smoothie" },
  { sourceId: 2393, title: "Spinach Wheat Bran Chapati (30% Wheat Bran, 70% Wheat Flour)" },
  { sourceId: 2403, title: "Multigrain Chapati" },
  { sourceId: 3454, title: "Curry Leaf Yellow Moong Dal", suppressImage: true },
  { sourceId: 2922, title: "Amaranth Flour Zucchini Thepla" },
];

export const EDITORIAL_REMOVED_SOURCE_RECIPE_IDS = new Set(
  EDITORIAL_RECIPE_REMOVALS.map((recipe) => recipe.sourceId)
);

export const EDITORIAL_TITLE_OVERRIDES = new Map(
  EDITORIAL_RECIPE_RENAMES.map((recipe) => [recipe.sourceId, recipe.title])
);

export const EDITORIAL_SUPPRESSED_IMAGE_SOURCE_IDS = new Set(
  EDITORIAL_RECIPE_RENAMES.filter((recipe) => recipe.suppressImage).map((recipe) => recipe.sourceId)
);
