import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { currentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { formId } = params;

    const form = await db.ingredientsForm.findUnique({
      where: {
        id: formId,
      },
    });

    if (!form) {
      return NextResponse.json("Form not found", { status: 404 });
    }

    const deletedForm = await db.ingredientsForm.delete({
      where: {
        id: formId,
      },
    });
    return NextResponse.json(deletedForm, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENT_FORM_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { formId } = params;
    const { name } = await req.json();

    const form = await db.ingredientsForm.update({
      where: {
        id: formId,
      },
      data: {
        name,
      },
    });
    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.log("[INGREDIENTFORMID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
