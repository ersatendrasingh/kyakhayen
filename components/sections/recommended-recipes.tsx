"use client";

import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import RecipeCard from "@/components/recipes/recipe-card";
import { RecipeWithCategory } from "@/types/recipe";
import { getRecommendedRecipes } from "@/actions/get-recommended-recipes";

const RecommendedRecipes = () => {
  const [recipes, setRecipes] = useState<RecipeWithCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false); // State to track if all recipes are loaded
  const [initialLoading, setInitialLoading] = useState(true); // State for initial loading

  const fetchMoreRecipes = async () => {
    try {
      setLoading(true);
      const newRecipes = await getRecommendedRecipes(currentPage + 1);
      if (newRecipes.length === 0) {
        setAllLoaded(true);
      } else {
        setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
        setCurrentPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching more recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const initialRecipes = await getRecommendedRecipes(1); // Always fetch the first page initially
        setRecipes(initialRecipes);
        setCurrentPage(1); // Reset page to 1 when initial recipes are fetched
        if (initialRecipes.length === 0) {
          setAllLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching initial recipes:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center pt-12 pb-10 mt-10 mb-10 bg-[#f9f9ff]">
      <Container>
        <h3 className="text-3xl font-bold text-center text-websecondary mb-10">
          Recommended Recipes For You
        </h3>
        {initialLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="m-4">
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-gray-200" />
                    <Skeleton className="h-4 w-[250px] bg-gray-200" />
                    <Skeleton className="h-4 w-[250px] bg-gray-200" />
                    <Skeleton className="h-4 w-[200px] bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="m-4"
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="flex justify-center mt-6">
          {!initialLoading && !loading && !allLoaded && (
            <Button
              onClick={fetchMoreRecipes}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 "
            >
              Load More
            </Button>
          )}
          {loading && <ClipLoader color="#E63946" />}
        </div>
      </Container>
    </div>
  );
};

export default RecommendedRecipes;
