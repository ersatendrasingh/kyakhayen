import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function hasSessionCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  return (
    cookie.includes("authjs.session-token") ||
    cookie.includes("__Secure-authjs.session-token") ||
    cookie.includes("next-auth.session-token") ||
    cookie.includes("__Secure-next-auth.session-token")
  );
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();

  return req.headers.get("x-real-ip")?.trim() || undefined;
}

export async function POST(req: Request) {
  try {
    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json("Missing recipeId", { status: 400 });
    }

    const user = hasSessionCookie(req) ? await currentUser() : undefined;
    const userId = user?.id;

    if (userId) {
      await db.userRecipeViews.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId },
      });

      return new NextResponse(null, { status: 204 });
    }

    const ipAddress = getClientIp(req);

    if (!ipAddress) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      await db.$transaction([
        db.recipeViews.create({ data: { recipeId, ipAddress } }),
        db.recipes.update({
          where: { id: recipeId },
          data: { views: { increment: 1 } },
        }),
      ]);
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[USER_RECIPE_ADD_VIEWS]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
