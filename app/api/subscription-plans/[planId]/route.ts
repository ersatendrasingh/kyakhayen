import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(req: Request, props: { params: Promise<{ planId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { planId } = params;

    const plan = await db.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return NextResponse.json("Plan not found", { status: 404 });
    }

    const deletedPlan = await db.plan.delete({
      where: {
        id: planId,
      },
    });
    return NextResponse.json(deletedPlan, { status: 200 });
  } catch (error) {
    console.log("[PLAN_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ planId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { planId } = params;
    const { name, ...values } = await req.json();
    let slug: string | undefined;
    if (name) {
      slug = slugify(name);
    }

    const plan = await db.plan.update({
      where: {
        id: planId,
      },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...values,
      },
    });
    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.log("[PLAN_ID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
