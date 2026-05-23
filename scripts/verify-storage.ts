import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const requiredEnv = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_MEDIA_BUCKET_NAME",
  "AWS_PRIVATE_BUCKET_NAME",
  "NEXT_PUBLIC_MEDIA_URL",
] as const;

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`${name} is required before verifying AWS storage.`);
  }
}

const mediaBucket = process.env.AWS_MEDIA_BUCKET_NAME as string;
const privateBucket = process.env.AWS_PRIVATE_BUCKET_NAME as string;

if (mediaBucket === privateBucket) {
  throw new Error("Media and private storage must use separate S3 buckets.");
}

const client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function verifyBucket(bucket: string) {
  const key = `_healthchecks/${Date.now()}-storage-connection.txt`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "Kya Khayen storage connection verified.",
      ContentType: "text/plain",
    })
  );

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function main() {
  await verifyBucket(mediaBucket);
  await verifyBucket(privateBucket);

  console.log("AWS media and private storage buckets are writable and clean-up works.");
  console.log(`Public media base URL: ${process.env.NEXT_PUBLIC_MEDIA_URL}`);
}

main().catch((error) => {
  console.error("[STORAGE_VERIFY]", error);
  process.exit(1);
});
