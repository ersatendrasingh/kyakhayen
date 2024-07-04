"use client";
import { useEffect, useState } from "react";
import AnimatedNumber from "@/components/animated-number";
import { CookingPot, Eye, Star } from "lucide-react";
import { getUserFavoriteRecipes } from "@/actions/get-user-favorite-recipes";
import RecipeCard from "@/components/recipes/recipe-card";
import { RecipeWithCategory } from "@/types/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { getUserReviewedRecipes } from "@/actions/get-user-reviewed-recipes";
import { getUserViewedRecipes } from "@/actions/get-user-viewed-recipes";

const UserDashboard = () => {
  const [favorites, setFavorites] = useState<RecipeWithCategory[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [reviews, setReviews] = useState<RecipeWithCategory[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [recipeViews, setRecipeViews] = useState<RecipeWithCategory[]>([]);
  const [showViewsRecipes, setShowViewsRecipes] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await getUserFavoriteRecipes();
        setFavorites(favorites);
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    };
    const fetchReviews = async () => {
      try {
        const reviews = await getUserReviewedRecipes();
        setReviews(reviews);
      } catch (error) {
        console.error("Error fetching reviewed recipes:", error);
      }
    };
    const fetchRecipeViews = async () => {
      try {
        const views = await getUserViewedRecipes();
        setRecipeViews(views);
      } catch (error) {
        console.error("Error fetching viewed recipes:", error);
      }
    };

    fetchFavorites();
    fetchReviews();
    fetchRecipeViews();
  }, []);
  const handleFavoritesClick = () => {
    setShowFavorites(true);
    setShowReviews(false);
    setShowViewsRecipes(false);
  };

  const handleReviewsClick = () => {
    setShowFavorites(false);
    setShowReviews(true);
    setShowViewsRecipes(false);
  };
  const handleViewsClick = () => {
    setShowFavorites(false);
    setShowReviews(false);
    setShowViewsRecipes(true);
  };
  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-3xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Dashboard
      </h1>
      <div className="flex flex-col md:flex-row md:justify-between py-10">
        <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
          <div
            className="bg-gradient-to-b from-rose-400 to-red-500 p-4 rounded-md shadow-md transition h-[300px] flex flex-col items-center justify-center cursor-pointer"
            onClick={handleFavoritesClick}
          >
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <CookingPot className="text-3xl text-white w-10 h-10" />
            </div>
            <AnimatedNumber value={favorites.length} />
            <p className="text-sm text-white">Favorite Recipes</p>
          </div>
        </div>
        <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
          <div
            className="h-[300px] bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-md shadow-md transition flex flex-col items-center justify-center cursor-pointer"
            onClick={handleReviewsClick}
          >
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <Star className="text-3xl text-white w-10 h-10" />
            </div>
            <AnimatedNumber value={reviews.length} />
            <p className="text-sm text-white">Reviewed Recipes</p>
          </div>
        </div>
        <div className="w-full md:w-1/3 mx-2 text-center">
          <div
            className="h-[300px] bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-md shadow-md transition flex flex-col items-center justify-center cursor-pointer"
            onClick={handleViewsClick}
          >
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <Eye className="text-3xl text-white w-10 h-10 " />
            </div>
            <AnimatedNumber value={recipeViews.length} />
            <p className="text-sm text-white">Watched Recipes</p>
          </div>
        </div>
      </div>
      {showFavorites && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Favorite Recipes</h2>
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-1"
                >
                  <RecipeCard recipe={favorite} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
      {showReviews && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Reviewed Recipes</h2>
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-1"
                >
                  <RecipeCard recipe={review} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
      {showViewsRecipes && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Reviewed Recipes</h2>
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipeViews.map((recipeView) => (
                <motion.div
                  key={recipeView.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-1"
                >
                  <RecipeCard recipe={recipeView} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
