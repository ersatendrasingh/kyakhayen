import { currentUser } from "@/lib/auth";
import { Queue } from "bullmq";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json("Missing recipeId", { status: 400 });
    }

    const userId = user?.id;

    const recipeAddView = new Queue("recipeAddView");
    await recipeAddView.add("recipeAddView", {
      userId: userId,
      recipeId: recipeId,
    });

    return NextResponse.json("View Count Queue Added", {
      status: 200,
    });
  } catch (error) {
    console.log("[USER_RECIPE_ADD_VIEWS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
