import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

    const prakritiQuestion = await db.prakritiQuestion.findUnique({
      where: {
        id: prakritiId,
      },
    });

    if (!prakritiQuestion) {
      return NextResponse.json("Question not found", { status: 404 });
    }

    const unPublishedPrakritiQuestion = await db.prakritiQuestion.update({
      where: {
        id: prakritiId,
      },
      data: {
        isPublished: false,
      },
    });
    return NextResponse.json(unPublishedPrakritiQuestion, { status: 200 });
  } catch (error) {
    console.log("[QUESTION_ID_UNPUBLISH]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
