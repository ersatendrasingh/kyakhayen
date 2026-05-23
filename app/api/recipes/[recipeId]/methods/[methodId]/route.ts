import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deleteFolderFromS3,
  deleteImageFromS3,
  getStorageKeyFromUrl,
} from "@/lib/s3utils";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ recipeId: string; methodId: string }> }
) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { recipeId, methodId } = params;
    const method = await db.recipeMethods.findUnique({
      where: {
        id: params.methodId,
        recipeId: params.recipeId,
      },
    });
    if (!method) {
      return NextResponse.json("Method not found", { status: 404 });
    }
    if (method.imageUrl) {
      await deleteImageFromS3(getStorageKeyFromUrl(method.imageUrl));
    }
    if (method.videoUrl) {
      await deleteImageFromS3(getStorageKeyFromUrl(method.videoUrl));
    }
    await deleteFolderFromS3(`recipes/${recipeId}/methods/${methodId}`);
    // delete method
    const deletedMethod = await db.recipeMethods.delete({
      where: {
        id: methodId,
        recipeId: recipeId,
      },
    });
    return NextResponse.json(deletedMethod, {
      status: 200,
    });
  } catch (error) {
    console.log("[METHOD_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  props: { params: Promise<{ recipeId: string; methodId: string }> }
) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const method = await db.recipeMethods.findUnique({
      where: {
        id: params.methodId,
        recipeId: params.recipeId,
      },
    });
    if (!method) {
      return NextResponse.json("Method not found", { status: 404 });
    }
    if (values) {
      const updatedMethod = await db.recipeMethods.update({
        where: {
          id: params.methodId,
          recipeId: params.recipeId,
        },
        data: {
          ...values,
        },
      });
      return NextResponse.json(updatedMethod, { status: 200 });
    }
  } catch (error) {
    console.log("[RECIPEMETHODSUPDATE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
