export type SourceRecipeDuplicateCluster = {
  canonicalSourceId: number;
  duplicateSourceIds: number[];
  canonicalTitle: string;
};

/**
 * Exact source-data duplicates verified against 8well app_recipes.
 * The canonical row preserves the cleanest, unsuffixed editorial identity.
 */
export const SOURCE_RECIPE_DUPLICATE_CLUSTERS: SourceRecipeDuplicateCluster[] = [
  {
    canonicalSourceId: 1,
    duplicateSourceIds: [3522],
    canonicalTitle: "Yellow Moong Dal Cheela Stuffed With Onions",
  },
  {
    canonicalSourceId: 65,
    duplicateSourceIds: [2574],
    canonicalTitle: "Amla Coriander Chutney",
  },
  {
    canonicalSourceId: 218,
    duplicateSourceIds: [2902, 2903],
    canonicalTitle: "Barley Salsa Porridge",
  },
  {
    canonicalSourceId: 732,
    duplicateSourceIds: [3273, 3274],
    canonicalTitle: "Gobhi Stuffed Oat Bran Chapati (30% Oat Bran, 70% Oat Flour)",
  },
  {
    canonicalSourceId: 1379,
    duplicateSourceIds: [3524],
    canonicalTitle: "Quinoa Vegetable Salad",
  },
  {
    canonicalSourceId: 1449,
    duplicateSourceIds: [3257],
    canonicalTitle: "Rice Poha (Add Chopped Onions, Beans, Cauliflower And Peanuts)",
  },
  {
    canonicalSourceId: 2591,
    duplicateSourceIds: [3268],
    canonicalTitle: "Raw Banana Curry",
  },
  {
    canonicalSourceId: 2950,
    duplicateSourceIds: [3525],
    canonicalTitle: "Vegetable Khichdi",
  },
  {
    canonicalSourceId: 2990,
    duplicateSourceIds: [3258, 3259],
    canonicalTitle: "Thin Poha Cutlets",
  },
];

export const DUPLICATE_SOURCE_RECIPE_IDS = new Set(
  SOURCE_RECIPE_DUPLICATE_CLUSTERS.flatMap((cluster) => cluster.duplicateSourceIds)
);
