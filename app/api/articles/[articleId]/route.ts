import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  deleteFolderFromS3,
  deleteImageFromS3,
  getStorageKeyFromUrl,
} from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(req: Request, props: { params: Promise<{ articleId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { articleId } = params;

    const post = await db.post.findUnique({
      where: {
        id: articleId,
      },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }
    if (post.imageUrl) {
      await deleteImageFromS3(getStorageKeyFromUrl(post.imageUrl));
    }
    await deleteFolderFromS3(`articles/${articleId}`);

    const deletedArticle = await db.post.delete({
      where: {
        id: articleId,
      },
    });
    return NextResponse.json(deletedArticle, { status: 200 });
  } catch (error) {
    console.log("[ARTICLE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ articleId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { articleId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const post = await db.post.update({
      where: {
        id: articleId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(user && { authorId: user.id }),
        ...values,
      },
    });
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.log("[ARTICLE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
