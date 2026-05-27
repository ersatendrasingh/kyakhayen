import { slugify } from "./slugify";

export function normalizeIngredientName(value: string) {
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",");
  const letters = cleaned.replace(/[^A-Za-z]/g, "");
  const uppercaseRatio =
    letters.length > 0
      ? letters.replace(/[^A-Z]/g, "").length / letters.length
      : 0;

  if (cleaned === cleaned.toLowerCase() || uppercaseRatio > 0.75) {
    return cleaned
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  return cleaned.replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

const displayNameOverrides = new Map(
  Object.entries({
    "Alcoholic Beverage, Beer, Light": "Light Beer",
    "Alcoholic Beverage, Beer, Light, Low Carb": "Low-Carb Light Beer",
    "Alcoholic Beverage, Beer, Regular, All": "Regular Beer",
    "Bengal Gram, Dal": "Chana Dal",
    "Bread Crumbs, Dry, Grated, Plain": "Breadcrumbs",
    "Bread, Multi-Grain (Includes Whole-Grain)": "Multigrain Bread",
    "Chicken, Poultry, Breast, Skinless": "Chicken Breast",
    "Chickpeas (Garbanzo Beans, Bengal Gram), Mature Seeds, Raw": "Chickpeas",
    "Chillies, Green - All Varieties": "Green Chillies",
    "Cucumber, Green, Elongate": "Cucumber",
    "Egg, Poultry, Whole, Raw": "Egg",
    "Leavening Agents, Yeast, Baker's, Active Dry": "Active Dry Yeast",
    "Milk, Whole, Cow": "Cow Milk",
    "Potato, Brown Skin, Big": "Potato",
    "Soup, Vegetable Broth, Ready To Serve": "Vegetable Broth",
    "Sweetener, Herbal Extract Powder From Stevia Leaf": "Stevia Powder",
    "Water, Tap, Drinking": "Water",
    "Wheat Flour, Whole-Grain": "Whole Wheat Flour",
    "Yogurt, Greek, Plain, Lowfat": "Low-Fat Greek Yogurt",
  }).map(([key, value]) => [key.toLowerCase(), value]),
);

const removableDescriptors = new Set([
  "all",
  "all varieties",
  "big",
  "common",
  "drinking",
  "elongate",
  "fresh",
  "local",
  "plain",
  "poultry",
  "regular",
  "ripe",
  "raw",
  "skinless",
  "small",
  "tap",
  "whole",
]);

const prefixDescriptors = new Map<string, string>([
  ["active dry", "Active Dry"],
  ["baked", "Baked"],
  ["boiled", "Boiled"],
  ["brown", "Brown"],
  ["canned", "Canned"],
  ["cooked", "Cooked"],
  ["country", "Country"],
  ["dried", "Dried"],
  ["dry", "Dry"],
  ["frozen", "Frozen"],
  ["golden", "Golden"],
  ["grated", "Grated"],
  ["green", "Green"],
  ["ground", "Ground"],
  ["light", "Light"],
  ["low carb", "Low-Carb"],
  ["lowfat", "Low-Fat"],
  ["orange", "Orange"],
  ["powdered", "Powdered"],
  ["red", "Red"],
  ["roasted", "Roasted"],
  ["skimmed", "Skimmed"],
  ["white", "White"],
  ["yellow", "Yellow"],
]);

const groupPrefixes = new Map<string, string>([
  ["Oil", "Oil"],
  ["Oils", "Oil"],
  ["Sauce", "Sauce"],
  ["Sauces", "Sauce"],
  ["Seed", "Seed"],
  ["Seeds", "Seeds"],
  ["Spice", "Spice"],
  ["Spices", "Spice"],
  ["Sugar", "Sugar"],
  ["Sugars", "Sugar"],
  ["Syrup", "Syrup"],
  ["Syrups", "Syrup"],
]);

function sentenceCaseWords(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[A-Za-z][A-Za-z']*/g, (word) => {
      const lower = word.toLowerCase();
      if (lower === "and" || lower === "of" || lower === "to") return lower;
      return lower.replace(/^[a-z]/, (letter) => letter.toUpperCase());
    });
}

function singularizeBase(value: string) {
  return value
    .replace(/^Onions$/i, "Onion")
    .replace(/^Mushrooms$/i, "Mushroom")
    .replace(/^Sugars$/i, "Sugar")
    .replace(/^Syrups$/i, "Syrup")
    .replace(/^Chillies$/i, "Chillies");
}

function compactIngredientPhrase(value: string) {
  return sentenceCaseWords(value)
    .replace(/\bChili\b/g, "Chilli")
    .replace(/\bLowfat\b/g, "Low-Fat")
    .replace(/\bMulti Grain\b/g, "Multigrain")
    .replace(/\bWhole Grain\b/g, "Whole Grain")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyGroupedDisplayName(parts: string[]) {
  const lowerGroup = parts[0].toLowerCase();
  if (lowerGroup === "alcoholic beverage" || lowerGroup === "alcoholic beverages") {
    const descriptors = parts.slice(1).map((part) => part.toLowerCase());
    const beverage = descriptors.find((part) =>
      ["beer", "wine", "rum", "vodka", "whiskey", "gin", "sake", "liqueur"].some(
        (token) => part.includes(token),
      ),
    ) ?? descriptors[0];
    const prefixes = descriptors
      .filter((part) => part !== beverage)
      .filter((part) => !removableDescriptors.has(part))
      .map((part) => prefixDescriptors.get(part) ?? compactIngredientPhrase(part));

    return compactIngredientPhrase(`${prefixes.join(" ")} ${beverage}`);
  }

  const group = groupPrefixes.get(parts[0]);
  if (!group) return null;

  const descriptors = parts
    .slice(1)
    .map((part) => part.toLowerCase())
    .filter((part) => !removableDescriptors.has(part));
  if (descriptors.length === 0) return compactIngredientPhrase(parts[0]);

  const keyPart = descriptors[0]
    .replace(/\bseeds?\b/gi, "")
    .replace(/\bagents?\b/gi, "")
    .trim();
  const prefixes = descriptors
    .slice(1)
    .map((part) => prefixDescriptors.get(part) ?? compactIngredientPhrase(part))
    .filter(Boolean);
  const base = compactIngredientPhrase(keyPart || descriptors[0]);

  if (group === "Oil") return compactIngredientPhrase(`${base} Oil`);
  if (group === "Sauce") return compactIngredientPhrase(`${base} Sauce`);
  if (group === "Sugar") return compactIngredientPhrase(`${prefixes.join(" ")} ${base} Sugar`);
  if (group === "Syrup") return compactIngredientPhrase(`${prefixes.join(" ")} ${base} Syrup`);
  if (group === "Seeds") return compactIngredientPhrase(`${prefixes.join(" ")} ${base} Seeds`);
  if (group === "Spice") return compactIngredientPhrase(`${prefixes.join(" ")} ${base}`);

  return compactIngredientPhrase(`${prefixes.join(" ")} ${base}`);
}

export function normalizeIngredientDisplayName(value: string) {
  const cleanName = normalizeIngredientName(value);
  const override = displayNameOverrides.get(cleanName.toLowerCase());
  if (override) return override;

  const normalized = cleanName
    .replace(/\(([^)]*)\)/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return compactIngredientPhrase(normalized);

  const grouped = applyGroupedDisplayName(parts);
  if (grouped) return grouped;

  const base = singularizeBase(parts[0]);
  const prefixes = parts
    .slice(1)
    .map((part) => part.toLowerCase().replace(/\s+-\s+/g, " "))
    .filter((part) => !removableDescriptors.has(part))
    .map((part) => prefixDescriptors.get(part) ?? compactIngredientPhrase(part));

  return compactIngredientPhrase(`${prefixes.join(" ")} ${base}`);
}

export function getIngredientSlug(name: string) {
  return slugify(normalizeIngredientName(name));
}
