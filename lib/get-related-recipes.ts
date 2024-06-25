import _ from "lodash";
import { RecipeWithCategory } from "@/types/recipe";
import { cosineSimilarity, createTFIDFVectors } from "@/lib/recommendations";

interface RecipeWithSimilarity extends RecipeWithCategory {
  similarity: number;
}

export const getRelatedRecommendations = (
  recipes: RecipeWithCategory[],
  selectedRecipeId?: string
): RecipeWithCategory[] => {
  // Check if selectedRecipeId is provided and filter recipes accordingly
  let filteredRecipes;
  if (selectedRecipeId) {
    const selectedRecipe = recipes.find(
      (recipe) => recipe.id === selectedRecipeId
    );
    if (!selectedRecipe) {
      return [];
    }
    // Exclude the selected recipe from filtered recipes
    filteredRecipes = recipes.filter(
      (recipe) => recipe.id !== selectedRecipeId
    );
  } else {
    filteredRecipes = recipes;
  }

  // Check if filtered recipes array is empty
  if (filteredRecipes.length === 0) {
    return [];
  }

  // Create TF-IDF vectors for all (or filtered) recipes
  const tfidfMatrix = createTFIDFVectors(filteredRecipes);

  // Extract the TF-IDF vector of the selected recipe if provided
  let targetVector;
  if (selectedRecipeId) {
    const selectedIndex = recipes.findIndex(
      (recipe) => recipe.id === selectedRecipeId
    );
    if (selectedIndex === -1) {
      return [];
    }
    targetVector = tfidfMatrix[selectedIndex];
  } else {
    targetVector = tfidfMatrix[0];
  }

  // Calculate cosine similarity of each recipe with the selected recipe's vector
  const similarities: RecipeWithSimilarity[] = filteredRecipes.map(
    (recipe, index) => {
      const vector = tfidfMatrix[index];
      return {
        ...recipe,
        similarity: cosineSimilarity(targetVector, vector),
      };
    }
  );

  // Order recipes by similarity in descending order
  const orderedRecipes = _.orderBy(
    similarities,
    ["similarity"],
    ["desc"]
  ) as RecipeWithSimilarity[];

  const recommendedRecipes = orderedRecipes.map(
    ({ similarity, ...rest }) => rest
  );

  return recommendedRecipes;
};
