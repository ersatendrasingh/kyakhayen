import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(req: Request, props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { categoryId } = params;

    const category = await db.ingredientCategories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json("Category not found", { status: 404 });
    }

    const deletedCategory = await db.ingredientCategories.delete({
      where: {
        id: categoryId,
      },
    });
    return NextResponse.json(deletedCategory, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENT_CATEGORY_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { categoryId } = params;
    const { name } = await req.json();
    let slug: string | undefined;
    if (name) {
      slug = slugify(name);
    }

    const category = await db.ingredientCategories.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        slug,
      },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENTCATEGORYID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
