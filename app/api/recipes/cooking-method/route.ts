import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { currentUser } from "@/lib/auth";
import { uploadFileToS3 } from "@/lib/s3utils";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const formData = await req.formData();
    const title = formData.get("title") as string;

    const slug = slugify(title);

    const cookingMethod = await db.cookingMethods.create({
      data: {
        title,
        slug,
      },
    });
    let imageUrl;
    const file = formData.get("imageUrl");

    if (file instanceof Blob) {
      // If file is a blob (i.e., a file)
      const fileContent = await file.arrayBuffer();
      const fileName = `cookingMethods/${cookingMethod.id}/${file.name}`;
      const uploadedData = await uploadFileToS3(
        fileContent as Buffer,
        file.type,
        fileName
      );
      if (uploadedData) {
        imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      }
    }
    if (imageUrl) {
      await db.cookingMethods.update({
        where: {
          id: cookingMethod.id,
        },
        data: {
          imageUrl,
        },
      });
    }

    return NextResponse.json(cookingMethod, { status: 200 });
  } catch (error) {
    console.log("[COOKING_METHOD]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
