"use client";

import Link from "next/link";
import Image from "next/image";

export default function RecipeNotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-500 to-orange-500 text-white">
      <div className="bg-white shadow-lg rounded-lg p-8 flex items-center max-w-3xl w-full animate-bounce-in">
        {/* Left Side: GIF */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/not-found.gif"
            alt="Recipe Not Found"
            width={250}
            height={250}
          />
        </div>

        {/* Right Side: Content */}
        <div className="ml-8 text-gray-800">
          <h2 className="text-4xl mb-4">Recipe Not Found</h2>
          <p className="text-lg mb-6">
            Sorry, the recipe you're looking for doesn't exist or may have been
            removed. Explore other delicious recipes!
          </p>
          <Link
            href="/recipes"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-full shadow-lg hover:scale-105 transform transition duration-300"
          >
            Browse Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
