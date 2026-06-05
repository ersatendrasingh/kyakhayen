import { NextResponse } from "next/server";

import { fetchFoodCompareSuggestions } from "@/lib/food-compare";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const contextId = searchParams.get("contextId");
    const limit = Number(searchParams.get("limit") || 18);
    const suggestions = await fetchFoodCompareSuggestions({ query, contextId, limit });

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[FOOD_COMPARE_SUGGESTIONS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
