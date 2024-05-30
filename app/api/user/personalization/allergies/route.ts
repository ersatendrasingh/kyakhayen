import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const { userId, newAllergy, removeAllOthers } = await req.json();

    // If the new allergy is "None", remove all other allergies
    if (removeAllOthers) {
      await db.userAllrgies.deleteMany({
        where: {
          userId: userId,
          allergyId: {
            not: newAllergy.id,
          },
        },
      });

      const existingNoneAllergy = await db.userAllrgies.findUnique({
        where: {
          userId_allergyId: {
            userId: userId,
            allergyId: newAllergy.id,
          },
        },
      });

      if (!existingNoneAllergy) {
        await db.userAllrgies.create({
          data: {
            userId: userId,
            allergyId: newAllergy.id,
          },
        });
      }

      return NextResponse.json(user, { status: 200 });
    } else {
      // If another allergy is selected, remove "None" if it's currently selected
      const noneAllergy = await db.allergies.findFirst({
        where: {
          title: "None",
        },
      });

      if (noneAllergy) {
        await db.userAllrgies.deleteMany({
          where: {
            userId: userId,
            allergyId: noneAllergy.id,
          },
        });
      }

      const existingUserAllergy = await db.userAllrgies.findUnique({
        where: {
          userId_allergyId: {
            userId: userId,
            allergyId: newAllergy.id,
          },
        },
      });

      if (!existingUserAllergy) {
        await db.userAllrgies.create({
          data: {
            userId: userId,
            allergyId: newAllergy.id,
          },
        });
      }

      return NextResponse.json(user, { status: 200 });
    }
  } catch (error) {
    console.error("[ADD_ALLERGY]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { userId, allergyId } = await req.json();

    await db.userAllrgies.delete({
      where: {
        userId_allergyId: {
          userId: userId,
          allergyId: allergyId,
        },
      },
    });

    return NextResponse.json("Allergy deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[DELETE_ALLERGY]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
