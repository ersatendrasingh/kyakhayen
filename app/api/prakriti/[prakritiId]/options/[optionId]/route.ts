import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { prakritiId: string; optionId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const prakritiQuestionOption = await db.prakritiQuestionOption.findUnique({
      where: {
        id: params.optionId,
        questionId: params.prakritiId,
      },
    });
    if (!prakritiQuestionOption) {
      return NextResponse.json("Option not found", { status: 404 });
    }
    const deletedOption = await db.prakritiQuestionOption.delete({
      where: {
        id: params.optionId,
      },
    });
    return NextResponse.json(deletedOption, {
      status: 200,
    });
  } catch (error) {
    console.log("[OPTIONDELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { prakritiId: string; optionId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const prakritiQuestionOption = await db.prakritiQuestionOption.findUnique({
      where: {
        id: params.optionId,
        questionId: params.prakritiId,
      },
    });
    if (!prakritiQuestionOption) {
      return NextResponse.json("Option not found", { status: 404 });
    }
    if (values) {
      const updatedOption = await db.prakritiQuestionOption.update({
        where: {
          id: params.optionId,
          questionId: params.prakritiId,
        },
        data: {
          ...values,
        },
      });
      return NextResponse.json(updatedOption, { status: 200 });
    }
  } catch (error) {
    console.log("[OPTIONSUPDATE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
