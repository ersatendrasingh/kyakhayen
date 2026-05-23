import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function DELETE(req: Request, props: { params: Promise<{ unitId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { unitId } = params;

    const unit = await db.units.findUnique({
      where: {
        id: unitId,
      },
    });

    if (!unit) {
      return NextResponse.json("Unit not found", { status: 404 });
    }

    const deletedUnit = await db.units.delete({
      where: {
        id: unitId,
      },
    });
    return NextResponse.json(deletedUnit, { status: 200 });
  } catch (error) {
    console.log("[UNIT_ID_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req: Request, props: { params: Promise<{ unitId: string }> }) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { unitId } = params;
    const { ...values } = await req.json();

    const unit = await db.units.update({
      where: {
        id: unitId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    console.log("[UNITID]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
