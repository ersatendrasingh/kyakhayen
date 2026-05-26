import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

const DEFAULT_IMAGE_DIRECTORY =
  "/Users/shivaan/My Personal Data/kyakhayen data/tags image/cookingskills";
const shouldApply = process.argv.includes("--apply");
const imageFilesBySlug: Record<string, string> = {
  beginner: "begginer.webp",
  begginer: "begginer.webp",
  quick: "begginer.webp",
  intermediate: "intermediate.webp",
  advanced: "advanced.webp",
  professional: "advanced.webp",
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to import cooking skill images.`);
  }

  return value;
}

function publicMediaUrl(key: string) {
  const baseUrl = requireEnv("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "");
  return `${baseUrl}/${key}`;
}

async function main() {
  requireEnv("DATABASE_URL");
  const imageDirectory =
    process.env.COOKING_SKILL_IMAGE_SOURCE_DIR ?? DEFAULT_IMAGE_DIRECTORY;
  const db = new PrismaClient();

  try {
    const cookingSkills = await db.recipeDifficulty.findMany({
      orderBy: [{ position: "asc" }, { title: "asc" }],
    });

    if (cookingSkills.length === 0) {
      throw new Error("No cooking skills exist in RecipeDifficulty.");
    }

    const rows = cookingSkills.map((cookingSkill) => {
      const slug = slugify(cookingSkill.title);
      const imageFile = imageFilesBySlug[slug];

      if (!imageFile) {
        throw new Error(
          `No cooking skill image mapping found for "${cookingSkill.title}" (${slug}).`,
        );
      }

      return {
        id: cookingSkill.id,
        title: cookingSkill.title,
        imageFile,
        imagePath: path.join(imageDirectory, imageFile),
      };
    });

    for (const row of rows) {
      await access(row.imagePath);
    }

    console.log(`Cooking skills: ${rows.map((row) => row.title).join(", ")}`);
    console.log(`Image directory: ${imageDirectory}`);

    if (!shouldApply) {
      console.log(
        "Dry run complete. Run with --apply to upload images and update cooking skills.",
      );
      return;
    }

    const storageClient = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
    const mediaBucket = requireEnv("AWS_MEDIA_BUCKET_NAME");

    for (const row of rows) {
      const key = `cooking-skills/${row.id}/${row.imageFile}`;

      await storageClient.send(
        new PutObjectCommand({
          Bucket: mediaBucket,
          Key: key,
          Body: await readFile(row.imagePath),
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      await db.recipeDifficulty.update({
        where: { id: row.id },
        data: { imageUrl: publicMediaUrl(key) },
      });
      console.log(`Uploaded ${row.title} -> ${key}`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("[COOKING_SKILLS_IMPORT]", error);
  process.exit(1);
});
