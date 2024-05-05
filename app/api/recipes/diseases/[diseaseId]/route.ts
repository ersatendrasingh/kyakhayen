import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { diseaseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { diseaseId } = params;

    const disease = await db.disease.findUnique({
      where: {
        id: diseaseId,
      },
    });

    if (!disease) {
      return NextResponse.json("Disease not found", { status: 404 });
    }
    if (disease.imageUrl) {
      const key = disease.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(diseaseId);

    const deletedDisease = await db.disease.delete({
      where: {
        id: diseaseId,
      },
    });
    return NextResponse.json(deletedDisease, { status: 200 });
  } catch (error) {
    console.log("[DISEASE_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { diseaseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { diseaseId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const disease = await db.disease.update({
      where: {
        id: diseaseId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(disease, { status: 200 });
  } catch (error) {
    console.log("[DISEASE_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
