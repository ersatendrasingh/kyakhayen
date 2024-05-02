"use client";

import { useState, useEffect, useRef } from "react";

import MenuItem from "@/components/recipes/menu-item";
import CourseContent from "@/components/recipes/recipe-ingredients";
import RecipeDetailsContent from "@/components/recipes/course-details-content";
import CourseFaqs from "@/components/recipes/course-faqs";
import Coursefaculty from "@/components/recipes/course-faculty";
import CourseCareer from "@/components/recipes/course-career";
import CourseOverview from "@/components/recipes/recipe-overview";
import {
  RecipeCategories,
  RecipeCookingTime,
  RecipeDifficulty,
  RecipeMethods as RecipeMethodType,
  Recipes,
  Units,
} from "@prisma/client";
import RecipeOverview from "@/components/recipes/recipe-overview";
import Container from "@/components/container";
import RecipeContent from "@/components/recipes/recipe-ingredients";
import RecipeIngredients from "@/components/recipes/recipe-ingredients";
import RecipeMethods from "./recipe-methods";

const menuItems = [
  {
    title: "Overview",
    id: 1,
  },
  {
    title: "Ingredients",
    id: 2,
  },
  {
    title: "Methods",
    id: 3,
  },
  {
    title: "Nutrition Facts",
    id: 4,
  },
  {
    title: "FAQs",
    id: 5,
  },
  {
    title: "Notes",
    id: 6,
  },
];
type RecipeIngredientType = {
  id: string;
  name: string;
  quantity: number;
  position: number;
  recipeId: string;
  unitId: string;
  notes?: string | null;
  unit: Units;
};
type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories | null;
  recipeIngredients: RecipeIngredientType[];
  recipeMethods: RecipeMethodType[];
  recipeCookingTime: RecipeCookingTime | null;
  recipeDifficulty: RecipeDifficulty | null;
};

interface RecipeDetailsProps {
  recipe: RecipeWithCategory;
}

const RecipeDetails = ({ recipe }: RecipeDetailsProps) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const sectionRefs: { [key: string]: React.RefObject<HTMLDivElement> } = {
    Overview: useRef<HTMLDivElement>(null),
    Ingredients: useRef<HTMLDivElement>(null),
    Methods: useRef<HTMLDivElement>(null),
    "Nutrition Facts": useRef<HTMLDivElement>(null),
    FAQs: useRef<HTMLDivElement>(null),
    Notes: useRef<HTMLDivElement>(null),
  };
  const [quantity, setQuantity] = useState(1);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    setQuantity(newQuantity);
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  });

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Container>
      <div className="relative">
        <div className="sticky top-[70px] z-10 bg-white w-full rounded-md shadow-sm transition my-4 py-4 flex overflow-x-auto ">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              tabTitle={item.title}
              isActive={activeTab === item.title}
              onClick={() => handleTabClick(item.title)}
              className="flex-shrink-0"
            />
          ))}
        </div>

        {menuItems.map((item) => (
          <div
            key={item.id}
            id={item.title}
            ref={sectionRefs[item.title]}
            className={`tab-content bg-white w-full rounded-md shadow-sm transition my-4 p-4 ${
              activeTab === item.title ? "active" : ""
            }`}
          >
            {item.title === "Overview" && (
              <>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                  About {recipe.title}
                </h2>
                <RecipeOverview recipe={recipe} quantity={quantity} />
              </>
            )}
            {item.title === "Ingredients" && (
              <>
                <div className="flex items-center justify-between mb-4 border-b-2 border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800  pb-2">
                    Ingredients
                  </h2>
                  <div className="flex items-center pb-2">
                    <span className="text-md px-2">Serving size:</span>
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="px-2 py-1 rounded-md bg-red-500 text-white text-sm mr-2"
                    >
                      -
                    </button>
                    <span className="text-lg px-2">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="px-2 py-1 bg-emerald-500 text-white rounded-md text-sm ml-2"
                    >
                      +
                    </button>
                  </div>
                </div>

                <RecipeIngredients
                  recipeIngredients={recipe.recipeIngredients}
                  quantity={quantity}
                />
              </>
            )}
            {item.title === "Methods" && (
              <>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                  Methods
                </h2>
                <RecipeMethods recipeMethods={recipe.recipeMethods} />
              </>
            )}
            {item.title === "Nutrition Facts" && (
              <>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                  Nutrition Facts
                </h2>
                {/* <Coursefaculty /> */}
              </>
            )}
            {item.title === "FAQs" && (
              <>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                  FAQs
                </h2>
                {/* <CourseFaqs faqs={course.faqs} /> */}
              </>
            )}
            {item.title === "Notes" && (
              <>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                  Notes
                </h2>
                {/* <CourseCareer /> */}
              </>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
};

export default RecipeDetails;
