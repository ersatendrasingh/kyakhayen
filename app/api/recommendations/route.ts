import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recipeRecommendations";

import { filterRecipesByUserPreferences } from "@/lib/filterRecipes";

export async function GET(req: Request) {
  try {
    const allRecipes = await filterRecipesByUserPreferences();

    const recommendations = getRecommendations(allRecipes);
    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.log("[RECOMMENDATIONS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
