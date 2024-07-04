import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    console.log("[USER_FAVORITE_RECIPE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
