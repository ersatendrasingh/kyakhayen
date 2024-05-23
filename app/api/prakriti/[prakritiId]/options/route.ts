import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { prakritiId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const { prakritiId } = params;
    if (values) {
      const lastPrakritiQuestionOption =
        await db.prakritiQuestionOption.findFirst({
          where: {
            questionId: prakritiId,
          },
          orderBy: {
            position: "desc",
          },
        });
      const newPosition = lastPrakritiQuestionOption
        ? lastPrakritiQuestionOption.position + 1
        : 1;
      const prakritiQuestionOption = await db.prakritiQuestionOption.create({
        data: {
          questionId: prakritiId,
          position: newPosition,
          ...values,
        },
      });
      return NextResponse.json(prakritiQuestionOption, { status: 200 });
    }
  } catch (error) {
    console.log("[QUESTION_OPTIONS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
