import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import {
  EDITORIAL_RECIPE_REMOVALS,
  EDITORIAL_RECIPE_RENAMES,
} from "../lib/recipe-editorial-cleanup";
import { slugify } from "../lib/slugify";

loadEnvConfig(process.cwd());

const SOURCE_SYSTEM = "8well";
const DEFAULT_IMAGE_KEY = "/recipes/default/default-recipe.png";
const shouldApply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const sourceIds = [
    ...EDITORIAL_RECIPE_REMOVALS.flatMap((recipe) => [recipe.sourceId, recipe.keepSourceId]),
    ...EDITORIAL_RECIPE_RENAMES.map((recipe) => recipe.sourceId),
  ];
  const rows = await db.recipes.findMany({
    where: { sourceSystem: SOURCE_SYSTEM, sourceId: { in: sourceIds } },
    select: {
      id: true,
      sourceId: true,
      title: true,
      slug: true,
      imageUrl: true,
      isPublished: true,
      views: true,
      _count: {
        select: {
          recipeComments: true,
          Review: true,
          RecipeViews: true,
          UserRecipeViews: true,
          Favorite: true,
          RecipeReaction: true,
        },
      },
    },
  });
  const defaultImageUrl = rows.find((row) => row.imageUrl?.includes(DEFAULT_IMAGE_KEY))?.imageUrl;
  const errors: string[] = [];
  const deletionIds: string[] = [];
  const activeRenames: Array<(typeof EDITORIAL_RECIPE_RENAMES)[number] & { id: string }> = [];

  if (!defaultImageUrl) {
    throw new Error("A default recipe image URL is required for editorial image suppression.");
  }

  console.log(`Editorial redundant recipe removals reviewed: ${EDITORIAL_RECIPE_REMOVALS.length}`);
  for (const action of EDITORIAL_RECIPE_REMOVALS) {
    const row = rows.find((recipe) => recipe.sourceId === action.sourceId);
    const kept = rows.find((recipe) => recipe.sourceId === action.keepSourceId);
    if (!row) {
      console.log(`Already removed source ${action.sourceId}: ${action.reason}`);
      continue;
    }
    if (!kept) {
      errors.push(`Cannot remove source ${action.sourceId}; kept source ${action.keepSourceId} is missing.`);
      continue;
    }

    const activity = row.views + Object.values(row._count).reduce((total, count) => total + count, 0);
    const sharedRealImage =
      row.isPublished &&
      kept.isPublished &&
      row.imageUrl === kept.imageUrl &&
      Boolean(row.imageUrl && !row.imageUrl.includes(DEFAULT_IMAGE_KEY));
    const safeMedia = !row.isPublished || sharedRealImage;
    console.log(
      `Remove ${row.sourceId} [${row.slug}] -> keep ${kept.sourceId} [${kept.slug}], activity=${activity}, media=${sharedRealImage ? "shared-image" : "draft"}, reason=${action.reason}`
    );

    if (activity > 0) {
      errors.push(`Source ${action.sourceId} has activity and cannot be deleted automatically.`);
    }
    if (!safeMedia) {
      errors.push(`Source ${action.sourceId} has unique published media and cannot be deleted automatically.`);
    }
    if (activity === 0 && safeMedia) {
      deletionIds.push(row.id);
    }
  }

  console.log(`Meaningful recipe variants reviewed for unique naming: ${EDITORIAL_RECIPE_RENAMES.length}`);
  for (const action of EDITORIAL_RECIPE_RENAMES) {
    const row = rows.find((recipe) => recipe.sourceId === action.sourceId);
    if (!row) {
      errors.push(`Cannot rename source ${action.sourceId}; recipe row is missing.`);
      continue;
    }
    const slug = slugify(action.title);
    const conflict = await db.recipes.findFirst({
      where: { slug, id: { notIn: [row.id, ...deletionIds] } },
      select: { title: true, sourceId: true },
    });
    if (conflict) {
      errors.push(`Rename slug ${slug} for source ${action.sourceId} conflicts with source ${conflict.sourceId}.`);
      continue;
    }
    const changed = Boolean(
      row.title !== action.title ||
      row.slug !== slug ||
      (action.suppressImage && (row.isPublished || !row.imageUrl?.includes(DEFAULT_IMAGE_KEY)))
    );
    console.log(
      `Rename ${row.sourceId} [${row.title}] -> ${action.title} [${slug}], image=${action.suppressImage ? "remove-and-draft" : "unchanged"}, pending=${changed}`
    );
    if (changed) {
      activeRenames.push({ ...action, id: row.id });
    }
  }

  console.log(`Verified redundant rows ready to delete: ${deletionIds.length}`);
  console.log(`Verified variant identity/media updates ready to apply: ${activeRenames.length}`);
  if (errors.length > 0) {
    errors.forEach((error) => console.error(`Blocked: ${error}`));
    throw new Error("Editorial same-name cleanup validation failed; no rows were changed.");
  }
  if (!shouldApply) {
    console.log("Dry run complete. Run with --apply after reviewing editorial cleanup actions.");
    return;
  }

  await db.$transaction(async (transaction) => {
    for (const action of activeRenames) {
      await transaction.recipes.update({
        where: { id: action.id },
        data: { slug: `editorial-transition-${action.id}` },
      });
    }
    for (const action of activeRenames) {
      await transaction.recipes.update({
        where: { id: action.id },
        data: {
          title: action.title,
          slug: slugify(action.title),
          ...(action.suppressImage
            ? { imageUrl: defaultImageUrl, isPublished: false }
            : {}),
        },
      });
      if (action.suppressImage) {
        await transaction.recipeMethods.updateMany({
          where: { recipeId: action.id },
          data: { isPublished: false },
        });
      }
    }
    await transaction.recipes.deleteMany({ where: { id: { in: deletionIds } } });
  });

  console.log(`Deleted redundant same-name recipes: ${deletionIds.length}`);
  console.log(`Updated distinct same-name recipes: ${activeRenames.length}`);
}

main()
  .catch((error) => {
    console.error("Recipe editorial cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
