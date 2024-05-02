import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { title } = await req.json();
    const slug = slugify(title);

    const recipe = await db.recipes.create({
      data: {
        title,
        slug,
      },
    });
    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    console.log("[RECIPES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
