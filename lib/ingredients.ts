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

export function getIngredientSlug(name: string) {
  return slugify(normalizeIngredientName(name));
}
