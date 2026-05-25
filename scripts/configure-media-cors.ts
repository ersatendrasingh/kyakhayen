import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const requiredEnv = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_MEDIA_BUCKET_NAME",
] as const;

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`${name} is required before configuring media CORS.`);
  }
}

const applicationOrigin = new URL(
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).origin;
const extraOrigins = process.argv
  .filter((argument) => argument.startsWith("--origin="))
  .map((argument) => new URL(argument.slice("--origin=".length)).origin);
const allowedOrigins = Array.from(new Set([applicationOrigin, ...extraOrigins]));
const apply = process.argv.includes("--apply");
const bucket = process.env.AWS_MEDIA_BUCKET_NAME as string;

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "HEAD", "PUT"],
      AllowedOrigins: allowedOrigins,
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3600,
    },
  ],
};

const client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function main() {
  if (!apply) {
    console.log(`Media bucket: ${bucket}`);
    console.log(JSON.stringify(corsConfiguration.CORSRules, null, 2));
    console.log("Dry run complete. Add --apply to save this CORS configuration.");
    return;
  }

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration,
    })
  );

  const saved = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
  console.log(`Media CORS configured for ${bucket}.`);
  console.log(JSON.stringify(saved.CORSRules ?? [], null, 2));
}

main().catch((error) => {
  console.error("[MEDIA_CORS]", error);
  process.exit(1);
});
