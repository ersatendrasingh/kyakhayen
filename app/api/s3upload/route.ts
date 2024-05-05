import { NextResponse } from "next/server";

import { deleteImageFromS3 } from "@/lib/s3utils";
import { uploadFileToS3 } from "@/lib/s3utils";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const formData = await req.formData();
    const previousImageUrl = formData.get("previousImageUrl") as string | null;
    const categoryId = formData.get("categoryId") as string | null;
    const recipeId = formData.get("recipeId") as string | null;
    const methodId = formData.get("methodId") as string | null;
    const cookingMethodId = formData.get("cookingMethodId") as string | null;
    const cuisineId = formData.get("cuisineId") as string | null;
    const allergyId = formData.get("allergyId") as string | null;
    const prakritiId = formData.get("prakritiId") as string | null;
    const healthGoalId = formData.get("healthGoalId") as string | null;
    const mealTimeId = formData.get("mealTimeId") as string | null;
    const diseaseId = formData.get("diseaseId") as string | null;
    const nutrientId = formData.get("nutrientId") as string | null;
    const dietTypeId = formData.get("dietTypeId") as string | null;

    const filesMap: Record<string, File[]> = {};
    formData.forEach((value: File | string | Blob, key: string) => {
      if (value instanceof File) {
        if (!filesMap[key]) {
          filesMap[key] = [];
        }
        filesMap[key].push(value);
      }
    });

    if (previousImageUrl) {
      // delete previous image
      const key = previousImageUrl.split(
        `${process.env.AWS_BUCKET_NAME as string}.s3.${
          process.env.AWS_REGION
        }.amazonaws.com/`
      )[1];

      await deleteImageFromS3(key);
    }
    let uploadedImageUrls: string[] | null = [];
    for (let fileName in filesMap) {
      if (Object.prototype.hasOwnProperty.call(filesMap, fileName)) {
        const files = filesMap[fileName];
        for (let file of files) {
          const fileContent = await file.arrayBuffer();
          // upload image
          if (categoryId) {
            const fileName = `categories/${categoryId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (cookingMethodId) {
            const fileName = `cookingMethods/${cookingMethodId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (cuisineId) {
            const fileName = `cuisines/${cuisineId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (allergyId) {
            const fileName = `allergies/${allergyId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (prakritiId) {
            const fileName = `prakriti/${prakritiId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (healthGoalId) {
            const fileName = `healthGoals/${healthGoalId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (mealTimeId) {
            const fileName = `mealTimes/${mealTimeId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (diseaseId) {
            const fileName = `diseases/${diseaseId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (nutrientId) {
            const fileName = `nutrients/${nutrientId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (dietTypeId) {
            const fileName = `dietTypes/${dietTypeId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else if (methodId) {
            const fileName = `recipes/${recipeId}/methods/${methodId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          } else {
            const fileName = `recipes/${recipeId}/${file.name}`;
            const uploadedData = await uploadFileToS3(
              fileContent as Buffer,
              file.type,
              fileName
            );
            if (uploadedData) {
              const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
              uploadedImageUrls.push(imageUrl);
            }
          }
        }
      }
    }
    return NextResponse.json(uploadedImageUrls, { status: 200 });
  } catch (error) {
    console.log("[S3Upload]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
