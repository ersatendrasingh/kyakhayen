import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  deleteFolderFromS3,
  deleteImageFromS3,
  getStorageKeyFromUrl,
} from "@/lib/s3utils";
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

    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json("Category not found", { status: 404 });
    }
    if (category.imageUrl) {
      await deleteImageFromS3(getStorageKeyFromUrl(category.imageUrl));
    }
    await deleteFolderFromS3(`articles/categories/${categoryId}`);

    const deletedCategory = await db.category.delete({
      where: {
        id: categoryId,
      },
    });
    return NextResponse.json(deletedCategory, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_ID_DELETE]", error);
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
    const { name, ...values } = await req.json();
    let slug: string | undefined;
    if (name) {
      slug = slugify(name);
    }

    const category = await db.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORYID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
