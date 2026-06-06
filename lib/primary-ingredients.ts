const PANTRY_EXACT_VALUES = new Set([
  "ajwain",
  "asafoetida",
  "bay leaf",
  "black pepper",
  "black salt",
  "cardamom",
  "carom seeds",
  "chaat masala",
  "chilli powder",
  "cinnamon",
  "clove",
  "coriander powder",
  "coriander seeds",
  "cumin",
  "cumin seeds",
  "curry leaves",
  "dalchini",
  "dhania powder",
  "elaichi",
  "fennel",
  "fenugreek seeds",
  "garam masala",
  "garlic",
  "ghee",
  "green chilli",
  "haldi",
  "hing",
  "jeera",
  "kasuri methi",
  "laung",
  "lemon",
  "lime",
  "masala",
  "methi dana",
  "mirch",
  "mustard oil",
  "mustard seeds",
  "namak",
  "oil",
  "pepper",
  "rai",
  "red chilli",
  "red chilli powder",
  "rock salt",
  "salt",
  "saunf",
  "sendha namak",
  "soy sauce",
  "sugar",
  "tel",
  "tej patta",
  "turmeric",
  "turmeric powder",
  "vinegar",
  "water",
]);

const PANTRY_PATTERN =
  /\b(ajwain|asafoetida|bay leaf|black pepper|black salt|cardamom|carom|chaat masala|chilli powder|cinnamon|clove|coriander powder|coriander seeds|cumin|curry leaves|dalchini|dhania powder|elaichi|fennel|garam masala|garlic|ginger|ghee|green chilli|haldi|hing|jeera|kasuri methi|laung|lemon|lime|masala|methi dana|mirch|mustard oil|mustard seeds|namak|oil|pepper|rai|red chilli|rock salt|salt|saunf|sendha namak|soy sauce|sugar|tel|tej patta|turmeric|vinegar|water)\b/;

const PRIMARY_INGREDIENT_ALIASES: Record<string, string> = {
  aloo: "potato",
  arbi: "colocasia",
  baingan: "brinjal",
  bhindi: "okra",
  chawal: "rice",
  dahi: "curd",
  doodhi: "bottle gourd",
  dudhi: "bottle gourd",
  ghia: "bottle gourd",
  ghiya: "bottle gourd",
  gobhi: "cauliflower",
  gobi: "cauliflower",
  kathal: "jackfruit",
  lauki: "bottle gourd",
  matar: "peas",
  palak: "spinach",
  paneer: "paneer",
  pyaz: "onion",
  shimla: "capsicum",
  "shimla mirch": "capsicum",
  tamatar: "tomato",
  tinda: "apple gourd",
  tori: "ridge gourd",
  torai: "ridge gourd",
  turai: "ridge gourd",
};

export const PRIMARY_INGREDIENT_HELP =
  "Search main fridge ingredients like lauki, turai, aloo, arbi, paneer, dal, rice, or curd. Pantry items like salt, haldi, mirch, oil, and masala will not show recipe results.";

export function normalizePrimaryIngredientValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalPrimaryIngredientValue(value: string) {
  const normalized = normalizePrimaryIngredientValue(value);

  return PRIMARY_INGREDIENT_ALIASES[normalized] ?? normalized;
}

export function primaryIngredientSearchTerms(value: string) {
  const canonical = canonicalPrimaryIngredientValue(value);
  const terms = new Set([canonical]);

  Object.entries(PRIMARY_INGREDIENT_ALIASES).forEach(([alias, aliasCanonical]) => {
    if (aliasCanonical === canonical) terms.add(alias);
  });

  return Array.from(terms).filter(Boolean);
}

export function isPrimaryIngredientValue(value: string) {
  const normalized = canonicalPrimaryIngredientValue(value);

  if (!normalized) return false;
  if (PANTRY_EXACT_VALUES.has(normalized)) return false;

  return !PANTRY_PATTERN.test(normalized);
}

export function filterPrimaryIngredientValues(values: string[], limit = 10) {
  const unique = new Set<string>();

  values.forEach((value) => {
    const canonical = canonicalPrimaryIngredientValue(value);
    if (!isPrimaryIngredientValue(canonical)) return;
    unique.add(canonical);
  });

  return Array.from(unique).slice(0, limit);
}
