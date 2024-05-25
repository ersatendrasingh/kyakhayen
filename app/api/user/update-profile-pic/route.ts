import { NextResponse } from "next/server";

import { deleteImageFromS3 } from "@/lib/s3utils";
import { uploadFileToS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const formData = await req.formData();
    const previousImageUrl = formData.get("previousImage") as string | null;
    const userId = formData.get("userId") as string | null;
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      // Handle error if file is not present in formData
      return NextResponse.json("No file uploaded or invalid file", {
        status: 400,
      });
    }
    if (previousImageUrl) {
      // delete previous image
      const key = previousImageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION
        }.amazonaws.com/`
      )[1];

      await deleteImageFromS3(key);
    }
    const fileName = `users/${userId}/${file.name}`;
    const fileContent = await file.arrayBuffer();
    const uploadedData = await uploadFileToS3(
      fileContent as Buffer,
      file.type,
      fileName
    );
    if (uploadedData) {
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      await db.user.update({
        where: {
          id: userId as string,
        },
        data: {
          image: imageUrl,
        },
      });
    }

    return NextResponse.json("Profile Pic Uploaded Successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
