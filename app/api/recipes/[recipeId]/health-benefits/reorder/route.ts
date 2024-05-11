import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { list } = await req.json();
    for (let item of list) {
      await db.recipeHealthBenefits.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }
    return NextResponse.json("Recipe benefits reordered successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[BENEFIT_REORDER]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
