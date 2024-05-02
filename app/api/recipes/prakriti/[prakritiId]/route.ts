import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFolderFromS3, deleteImageFromS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(
  req: Request,
  { params }: { params: { prakritiId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { prakritiId } = params;

    const prakriti = await db.prakriti.findUnique({
      where: {
        id: prakritiId,
      },
    });

    if (!prakriti) {
      return NextResponse.json("Prakriti not found", { status: 404 });
    }
    if (prakriti.imageUrl) {
      const key = prakriti.imageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION as string
        }.amazonaws.com/`
      )[1];
      await deleteImageFromS3(key);
    }
    await deleteFolderFromS3(prakritiId);

    const deletedPrakriti = await db.prakriti.delete({
      where: {
        id: prakritiId,
      },
    });
    return NextResponse.json(deletedPrakriti, { status: 200 });
  } catch (error) {
    console.log("[PRAKRIT_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { prakritiId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { prakritiId } = params;
    const { title, ...values } = await req.json();
    let slug: string | undefined;
    if (title) {
      slug = slugify(title);
    }

    const prakriti = await db.prakriti.update({
      where: {
        id: prakritiId,
      },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(prakriti, { status: 200 });
  } catch (error) {
    console.log("[PRAKRITIID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
