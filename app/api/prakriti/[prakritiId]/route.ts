import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

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

    const prakritiQuestion = await db.prakritiQuestion.findUnique({
      where: {
        id: prakritiId,
      },
    });

    if (!prakritiQuestion) {
      return NextResponse.json("Prakriti question not found", { status: 404 });
    }

    const deletedQuestion = await db.prakritiQuestion.delete({
      where: {
        id: prakritiId,
      },
    });
    return NextResponse.json(deletedQuestion, { status: 200 });
  } catch (error) {
    console.log("[PRAKRITI_QUESTION_ID_DELETE]", error);
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
    const { ...values } = await req.json();

    const prakritiQuestion = await db.prakritiQuestion.update({
      where: {
        id: prakritiId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(prakritiQuestion, { status: 200 });
  } catch (error) {
    console.log("[PRAKRITI_QUESTION_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
