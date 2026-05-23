import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { deleteImageFromS3, getStorageKeyFromUrl } from "@/lib/s3utils";

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { url } = (await req.json()) as { url?: string };

    if (!url) {
      return NextResponse.json("Media URL is required.", { status: 400 });
    }

    await deleteImageFromS3(getStorageKeyFromUrl(url));

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
