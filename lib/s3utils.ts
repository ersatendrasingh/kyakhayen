//const fs = require("fs");
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const uploadFileToS3 = async (
  filePath: Buffer,
  fileType: string,
  imageUrl: string
) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `${imageUrl}`,
    Body: filePath,
    ContentType: fileType,
  };
  const command = new PutObjectCommand(params);

  try {
    const data = await s3.send(command);
    return data;
  } catch (error) {
    throw new Error("Something went wrong");
  }
};
export const deleteImageFromS3 = async (imageUrl: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `${imageUrl}`,
  };

  try {
    const command = new DeleteObjectCommand(params);
    const data = await s3.send(command);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteFolderFromS3 = async (folderKey: string) => {
  try {
    await deleteFolderObjects(folderKey).then(async () => {
      // Then delete the folder itself
      const data = await deleteFolder(folderKey);
      return data;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function deleteFolderObjects(folderKey: string) {
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Prefix: `${folderKey}`,
  };

  try {
    const data = await s3.send(new ListObjectsV2Command(listParams));
    const objects = data.Contents;

    if (!objects) {
      console.log("No objects found in the folder");
      return;
    }

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Delete: { Objects: [] as { Key: string }[] },
    };

    objects.forEach((obj) => {
      // Check if the Key is defined before pushing it into the array
      if (obj.Key) {
        deleteParams.Delete.Objects.push({ Key: obj.Key });
      }
    });

    const response = await s3.send(new DeleteObjectsCommand(deleteParams));
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Function to delete the folder itself
async function deleteFolder(folderKey: string) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `${folderKey}`,
  };

  try {
    const data = await s3.send(new DeleteObjectCommand(deleteParams));
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
