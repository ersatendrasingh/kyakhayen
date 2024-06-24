import * as tf from "@tensorflow/tfjs";
import { RecipeWithCategory } from "@/types/recipe";
export const createTFIDFVectors = (recipes: RecipeWithCategory[]) => {
  const documents = recipes.map((recipe) => {
    const cookingTimes = [
      recipe.recipeCookingTime?.prepTime || "",
      recipe.recipeCookingTime?.cookTime || "",
      recipe.recipeCookingTime?.restTime || "",
    ].join(" ");

    const ingredients = recipe.recipeIngredients
      .map((ing) => ing.ingredient.name)
      .join(" ");
    const methods = recipe.recipeMethods
      .map((method) => method.title)
      .join(" ");
    const benefits = recipe.recipeHealthBenefits
      .map((benefit) => benefit.title)
      .join(" ");
    const dietTypes =
      recipe.recipeDietType?.map((diet) => diet.dietType.title) || [];
    const recipeTypes =
      recipe.recipeRecipeType?.map((type) => type.recipeType.title) || [];
    const cookingMethods =
      recipe.recipeCookingMethods?.map(
        (method) => method.cookingMethod.title
      ) || [];
    const cuisines =
      recipe.recipeCuisine?.map((cuisine) => cuisine.cuisine.title) || [];
    const nutrients =
      recipe.recipeNutrient?.map((nutrient) => nutrient.nutrient.title) || [];
    const mealTimes =
      recipe.recipeMealTime?.map((meal) => meal.mealTimeId) || [];

    return [
      ingredients,
      methods,
      benefits,
      cookingTimes,
      ...dietTypes,
      ...recipeTypes,
      recipe.recipeDifficulty?.title || "",
      recipe.recipeSeasons?.title || "",
      ...cookingMethods,
      ...cuisines,
      ...nutrients,
      ...mealTimes,
    ].join(" ");
  });

  const uniqueWords = Array.from(new Set(documents.join(" ").split(" ")));
  const wordIndex = Object.fromEntries(
    uniqueWords.map((word, index) => [word, index])
  );

  const numWords = uniqueWords.length;
  const tfidf = documents.map((doc) => {
    const tfidfVector = new Array(numWords).fill(0);
    doc.split(" ").forEach((word) => {
      if (word in wordIndex) {
        tfidfVector[wordIndex[word]] += 1;
      }
    });
    return tf.tensor(tfidfVector);
  });

  return tf.stack(tfidf);
};

// Function to calculate cosine similarity
export const cosineSimilarity = (a: tf.Tensor, b: tf.Tensor): number => {
  const dotProduct = tf.tidy(() => tf.sum(tf.mul(a, b)).arraySync() as number);
  const magnitudeA = tf.tidy(
    () => tf.sqrt(tf.sum(tf.square(a))).arraySync() as number
  );
  const magnitudeB = tf.tidy(
    () => tf.sqrt(tf.sum(tf.square(b))).arraySync() as number
  );
  return dotProduct / (magnitudeA * magnitudeB);
};
