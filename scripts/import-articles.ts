import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { slugify } from "../lib/slugify";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_TAGS,
  type ProductionArticle,
  productionArticles,
} from "./data/production-articles";

loadEnvConfig(process.cwd());

const DEFAULT_IMAGE_DIRECTORY =
  "/Users/shivaan/My Personal Data/kyakhayen data/Articles Images";
const shouldApply = process.argv.includes("--apply");

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to import articles.`);
  return value;
}

function publicMediaUrl(key: string) {
  return `${requireEnv("NEXT_PUBLIC_MEDIA_URL").replace(/\/+$/, "")}/${key}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInternalLinks(article: ProductionArticle) {
  const links = [
    article.tags.includes("Summer")
      ? { href: "/recipes?k=summer&type=season", label: "Explore summer recipes" }
      : null,
    article.tags.includes("Breakfast")
      ? { href: "/recipes?k=breakfast&type=mealTime", label: "See breakfast ideas" }
      : null,
    article.tags.includes("Plant-Based")
      ? { href: "/recipes?k=vegan&type=category", label: "Browse plant-based recipes" }
      : null,
    article.tags.includes("Weeknight Meals")
      ? { href: "/recipes?k=dinner&type=mealTime", label: "Find dinner recipes" }
      : null,
    { href: "/recipes", label: "Explore all recipes" },
  ].filter(
    (
      link,
    ): link is {
      href: string;
      label: string;
    } => Boolean(link),
  );
  const uniqueLinks = Array.from(
    new Map(links.map((link) => [link.href, link])).values(),
  ).slice(0, 3);

  return `<aside><h3>Continue in the kitchen</h3><p>Ready to put these ideas on the table? Browse dishes that fit this story, or shape a weekly plan around the food you enjoy.</p><p>${uniqueLinks
    .map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`)
    .join(" &nbsp;|&nbsp; ")} &nbsp;|&nbsp; <a href="/meal-plan/create">Create your meal plan</a></p></aside>`;
}

function renderArticleContent(article: ProductionArticle) {
  const reference =
    article.referenceUrl && article.referenceLabel
      ? `<p><strong>Trusted reference:</strong> <a href="${escapeHtml(article.referenceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.referenceLabel)}</a>.</p>`
      : "";
  const safety = article.safetyNote
    ? `<aside><h3>Important note</h3><p>${escapeHtml(article.safetyNote)}</p>${reference}</aside>`
    : reference;
  return [
    `<p>${escapeHtml(article.intro)}</p>`,
    ...article.sections.map(
      (section) =>
        `<h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.copy)}</p><ul>${section.tips
          .map((tip) => `<li>${escapeHtml(tip)}</li>`)
          .join("")}</ul>`
    ),
    safety,
    renderInternalLinks(article),
    `<h2>Bring it to your table</h2><p>${escapeHtml(article.closing)}</p>`,
    "<p><em>Kya Khayen is a KASA product offering food inspiration and meal-planning information only. It does not provide medical, allergy-safety or nutrition treatment advice.</em></p>",
  ].join("");
}

async function validateRows(imageDirectory: string) {
  const categories = new Set<string>(ARTICLE_CATEGORIES);
  const tags = new Set<string>(ARTICLE_TAGS);
  const slugs = new Set<string>();
  for (const article of productionArticles) {
    const slug = slugify(article.title);
    if (!slug || slugs.has(slug)) throw new Error(`Duplicate or invalid article slug: ${article.title}`);
    if (!categories.has(article.category)) throw new Error(`Unknown category for "${article.title}": ${article.category}`);
    article.tags.forEach((tag) => {
      if (!tags.has(tag)) throw new Error(`Unknown tag for "${article.title}": ${tag}`);
    });
    await access(path.join(imageDirectory, article.sourceImage));
    slugs.add(slug);
  }
}

async function main() {
  const imageDirectory = process.env.ARTICLE_IMAGE_SOURCE_DIR ?? DEFAULT_IMAGE_DIRECTORY;
  await validateRows(imageDirectory);
  console.log(`Validated ${productionArticles.length} original articles and matching cover images.`);
  console.log(`Categories: ${ARTICLE_CATEGORIES.join(", ")}`);
  console.log(`Tags: ${ARTICLE_TAGS.join(", ")}`);

  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply to upload cover images and seed published articles.");
    return;
  }

  requireEnv("DATABASE_URL");
  const db = new PrismaClient();
  const storage = new S3Client({
    region: requireEnv("AWS_REGION"),
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
  const bucket = requireEnv("AWS_MEDIA_BUCKET_NAME");

  try {
    const author = await db.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!author) throw new Error("An admin account is required before importing published articles.");

    const categoryRows = await Promise.all(
      ARTICLE_CATEGORIES.map((title, index) =>
        db.category.upsert({
          where: { title },
          update: { position: index + 1, isPublished: true },
          create: { title, slug: slugify(title), position: index + 1, isPublished: true },
        })
      )
    );
    const tagRows = await Promise.all(
      ARTICLE_TAGS.map((title, index) =>
        db.articleTag.upsert({
          where: { title },
          update: { position: index + 1, isPublished: true },
          create: { title, slug: slugify(title), position: index + 1, isPublished: true },
        })
      )
    );
    const categories = new Map(categoryRows.map((row) => [row.title, row]));
    const tags = new Map(tagRows.map((row) => [row.title, row]));
    const categoryCover = new Map<string, string>();
    const tagCover = new Map<string, string>();

    for (const article of productionArticles) {
      const slug = slugify(article.title);
      const key = `articles/covers/${slug}.webp`;
      const imagePath = path.join(imageDirectory, article.sourceImage);
      const bytes = await readFile(imagePath);
      const imageUrl = publicMediaUrl(key);
      await storage.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      await db.mediaAsset.upsert({
        where: { storageKey: key },
        update: { name: article.title, url: imageUrl, altText: article.title, fileSize: BigInt(bytes.length) },
        create: {
          name: article.title,
          url: imageUrl,
          storageKey: key,
          mimeType: "image/webp",
          mediaType: "IMAGE",
          fileSize: BigInt(bytes.length),
          altText: article.title,
        },
      });
      const post = await db.post.upsert({
        where: { slug },
        update: {
          title: article.title,
          metaTitle: article.title,
          metaDescription: article.description,
          metaSlug: slug,
          content: renderArticleContent(article),
          imageUrl,
          isPublished: true,
        },
        create: {
          title: article.title,
          slug,
          metaTitle: article.title,
          metaDescription: article.description,
          metaSlug: slug,
          content: renderArticleContent(article),
          imageUrl,
          isPublished: true,
          authorId: author.id,
        },
      });
      const category = categories.get(article.category);
      if (!category) throw new Error(`Unable to resolve category "${article.category}".`);
      const articleTags = article.tags.map((tag) => tags.get(tag)).filter((row): row is NonNullable<typeof row> => Boolean(row));
      await db.$transaction([
        db.postCategory.deleteMany({ where: { postId: post.id } }),
        db.postCategory.create({ data: { postId: post.id, categoryId: category.id } }),
        db.postTag.deleteMany({ where: { postId: post.id } }),
        db.postTag.createMany({ data: articleTags.map((tag) => ({ postId: post.id, tagId: tag.id })) }),
      ]);
      if (!categoryCover.has(category.id)) categoryCover.set(category.id, imageUrl);
      articleTags.forEach((tag) => {
        if (!tagCover.has(tag.id)) tagCover.set(tag.id, imageUrl);
      });
      console.log(`Published: ${article.title}`);
    }

    await Promise.all(
      categoryRows.map((row) => db.category.update({ where: { id: row.id }, data: { imageUrl: categoryCover.get(row.id) } }))
    );
    await Promise.all(
      tagRows.map((row) => db.articleTag.update({ where: { id: row.id }, data: { imageUrl: tagCover.get(row.id) } }))
    );
    console.log(`Import complete: ${productionArticles.length} articles published with categories, tags and media covers.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("[ARTICLE_IMPORT]", error);
  process.exit(1);
});
