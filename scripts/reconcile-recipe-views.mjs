import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function toNumber(value) {
  if (typeof value === "bigint") return Number(value);
  return Number(value ?? 0);
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, toNumber(value)]),
  );
}

async function main() {
  const [summary] = await prisma.$queryRaw`
    SELECT
      COUNT(*) AS totalRecipes,
      SUM(CASE WHEN r.views <> COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0) THEN 1 ELSE 0 END) AS mismatchedRecipes,
      SUM(r.views) AS currentViews,
      SUM(COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0)) AS trackedViews
    FROM Recipes r
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM RecipeViews
      GROUP BY recipeId
    ) rv ON rv.recipeId = r.id
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM UserRecipeViews
      GROUP BY recipeId
    ) uv ON uv.recipeId = r.id
  `;

  const mismatches = await prisma.$queryRaw`
    SELECT
      r.id,
      r.title,
      r.views AS currentViews,
      COALESCE(rv.viewCount, 0) AS anonymousViews,
      COALESCE(uv.viewCount, 0) AS userViews,
      COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0) AS trackedViews
    FROM Recipes r
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM RecipeViews
      GROUP BY recipeId
    ) rv ON rv.recipeId = r.id
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM UserRecipeViews
      GROUP BY recipeId
    ) uv ON uv.recipeId = r.id
    WHERE r.views <> COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0)
    ORDER BY ABS(r.views - (COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0))) DESC
    LIMIT 10
  `;

  console.log("Recipe view reconciliation summary");
  console.table([normalizeRow(summary)]);

  if (mismatches.length > 0) {
    console.log("Largest mismatches");
    console.table(
      mismatches.map((row) => ({
        id: row.id,
        title: row.title,
        currentViews: toNumber(row.currentViews),
        anonymousViews: toNumber(row.anonymousViews),
        userViews: toNumber(row.userViews),
        trackedViews: toNumber(row.trackedViews),
      })),
    );
  }

  if (dryRun) {
    console.log("Dry run only. No recipe view counts were updated.");
    return;
  }

  await prisma.$executeRaw`
    UPDATE Recipes r
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM RecipeViews
      GROUP BY recipeId
    ) rv ON rv.recipeId = r.id
    LEFT JOIN (
      SELECT recipeId, COUNT(*) AS viewCount
      FROM UserRecipeViews
      GROUP BY recipeId
    ) uv ON uv.recipeId = r.id
    SET r.views = COALESCE(rv.viewCount, 0) + COALESCE(uv.viewCount, 0)
  `;

  console.log("Recipe view counts reconciled.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
