import _ from "lodash";
import { RecipeWithCategory } from "@/types/recipe";
import { cosineSimilarity, createTFIDFVectors } from "@/lib/recomendedUtils";

export const getRecommendations = (
  recipes: RecipeWithCategory[],
  page: number,
  pageSize: number
): RecipeWithCategory[] => {
  if (recipes.length === 0) return [];

  const tfidfMatrix = createTFIDFVectors(recipes);
  const targetVector = tfidfMatrix.slice([0, 0], [1, -1]).squeeze();

  const similarities = recipes.map((recipe, index) => {
    const vector = tfidfMatrix.slice([index, 0], [1, -1]).squeeze();
    return {
      ...recipe,
      similarity: cosineSimilarity(targetVector, vector),
    };
  });

  const orderedRecipes = _.orderBy(similarities, ["similarity"], ["desc"]);

  // Implement pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  return orderedRecipes.slice(startIndex, endIndex); // Return the recipes for the current page
};
