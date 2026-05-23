"use client";

import { useEffect, useRef, useState } from "react";

import MenuItem from "@/components/recipes/menu-item";
import RecipeOverview from "@/components/recipes/recipe-overview";
import RecipeIngredients from "@/components/recipes/recipe-ingredients";
import RecipeMethods from "./recipe-methods";
import RecipeNutritionFacts from "./recipe-nutrition-facts";
import type { RecipeWithCategory } from "@/types/recipe";

const menuItems = ["Overview", "Ingredients", "Methods", "Nutrition Facts"] as const;

interface RecipeDetailsProps {
  recipe: RecipeWithCategory;
}

const RecipeDetails = ({ recipe }: RecipeDetailsProps) => {
  const [activeTab, setActiveTab] = useState<(typeof menuItems)[number]>("Overview");
  const [quantity, setQuantity] = useState(1);
  const overviewRef = useRef<HTMLDivElement>(null);
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const methodsRef = useRef<HTMLDivElement>(null);
  const nutritionRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    Overview: overviewRef,
    Ingredients: ingredientsRef,
    Methods: methodsRef,
    "Nutrition Facts": nutritionRef,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id as (typeof menuItems)[number]);
          }
        });
      },
      { threshold: 0.5 }
    );
    [overviewRef, ingredientsRef, methodsRef, nutritionRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const handleTabClick = (tabName: (typeof menuItems)[number]) => {
    setActiveTab(tabName);
    document.getElementById(tabName)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative">
      <div className="sticky top-[70px] z-10 my-4 flex w-full overflow-x-auto rounded-xl border border-border/60 bg-card py-4 shadow-sm transition">
        {menuItems.map((item) => (
          <MenuItem
            key={item}
            tabTitle={item}
            isActive={activeTab === item}
            onClick={() => handleTabClick(item)}
            className="flex-shrink-0"
          />
        ))}
      </div>

      {menuItems.map((item) => (
        <div
          key={item}
          id={item}
          ref={sectionRefs[item]}
          className={`tab-content my-4 w-full rounded-xl border border-border/60 bg-card p-4 text-card-foreground shadow-sm transition ${
            activeTab === item ? "active" : ""
          }`}
        >
          {item === "Overview" && (
            <>
              <h2 className="mb-4 border-b-2 border-border pb-2 text-xl font-bold text-foreground">
                About {recipe.title}
              </h2>
              <RecipeOverview recipe={recipe} quantity={quantity} />
            </>
          )}
          {item === "Ingredients" && (
            <>
              <div className="mb-4 flex items-center justify-between border-b-2 border-border">
                <h2 className="pb-2 text-xl font-bold text-foreground">Ingredients</h2>
                <div className="flex items-center pb-2">
                  <span className="text-md px-2">Serving size:</span>
                  <button onClick={() => setQuantity(Math.max(quantity - 1, 1))} className="px-2 py-1 rounded-md bg-red-500 text-white text-sm mr-2">-</button>
                  <span className="text-lg px-2">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-2 py-1 bg-emerald-500 text-white rounded-md text-sm ml-2">+</button>
                </div>
              </div>
              <RecipeIngredients recipeIngredients={recipe.recipeIngredients} quantity={quantity} />
            </>
          )}
          {item === "Methods" && (
            <>
              <h2 className="mb-4 border-b-2 border-border pb-2 text-xl font-bold text-foreground">Methods</h2>
              <RecipeMethods recipeMethods={recipe.recipeMethods} />
            </>
          )}
          {item === "Nutrition Facts" && (
            <>
              <h2 className="mb-4 border-b-2 border-border pb-2 text-xl font-bold text-foreground">Nutrition Facts</h2>
              <RecipeNutritionFacts recipeIngredients={recipe.recipeIngredients} />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecipeDetails;
