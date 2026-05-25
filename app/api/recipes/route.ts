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
    const values = (await req.json()) as {
      title?: string;
      recipeCategoriesId?: string | null;
    };
    const title = values.title?.trim();

    if (!title) {
      return NextResponse.json("Recipe title is required", { status: 400 });
    }

    const baseSlug = slugify(title) || "recipe";
    let slug = baseSlug;
    let suffix = 2;

    while (await db.recipes.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const recipe = await db.recipes.create({
      data: {
        title,
        slug,
        recipeCategoriesId: values.recipeCategoriesId || null,
      },
    });
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.log("[RECIPES]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
