import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPersonalizationComplete } from "@/lib/personalization";
import { Queue } from "bullmq";
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
      const updatedUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
        include: {
          userCuisines: true,
          UserAllrgies: true,
        },
      });

      // Check if personalization is complete
      const isPersonalised = isPersonalizationComplete(updatedUser);

      if (isPersonalised) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isPersonalised,
          },
        });

        //Call the generate meal plan queue
        const mealPlanQueue = new Queue("generateMealPlan");
        await mealPlanQueue.add("generateMealPlan", { userId: user.id });
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
      const updatedUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
        include: {
          userCuisines: true,
          UserAllrgies: true,
        },
      });

      // Check if personalization is complete
      const isPersonalised = isPersonalizationComplete(updatedUser);

      if (isPersonalised) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isPersonalised,
          },
        });

        //Call the generate meal plan queue
        const mealPlanQueue = new Queue("generateMealPlan");
        await mealPlanQueue.add("generateMealPlan", { userId: user.id });
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
    const updatedUser = await db.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        userCuisines: true,
        UserAllrgies: true,
      },
    });

    // Check if personalization is complete
    const isPersonalised = isPersonalizationComplete(updatedUser);

    if (isPersonalised) {
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          isPersonalised,
        },
      });

      //Call the generate meal plan queue
      const mealPlanQueue = new Queue("generateMealPlan");
      await mealPlanQueue.add("generateMealPlan", { userId: userId });
    }
    return NextResponse.json("Allergy deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.log("[DELETE_ALLERGY]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
