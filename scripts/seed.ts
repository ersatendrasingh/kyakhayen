import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function ensureGenderOptions() {
  for (const [title, position] of [
    ["Male", 1],
    ["Female", 2],
    ["Prefer not to say", 3],
  ] as const) {
    const existing = await db.gender.findFirst({ where: { title } });

    if (existing) {
      await db.gender.update({ where: { id: existing.id }, data: { position } });
    } else {
      await db.gender.create({ data: { title, position } });
    }
  }
}

async function ensurePlans() {
  const plans = [
    {
      name: "Freemium",
      slug: "freemium",
      durationDays: 7,
      regularPriceInr: 0,
      priceInr: 0,
      regularPriceUsd: 0,
      priceUsd: 0,
      features: ["Recipe discovery", "Basic meal planning"],
    },
    {
      name: "Monthly",
      slug: "monthly",
      durationDays: 30,
      regularPriceInr: 299,
      priceInr: 199,
      regularPriceUsd: 5,
      priceUsd: 3,
      features: [
        "Personalized meal plans",
        "Nutrition filters",
        "Saved favourites",
      ],
    },
  ];

  for (const plan of plans) {
    const saved = await db.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        durationDays: plan.durationDays,
        regularPriceInr: plan.regularPriceInr,
        priceInr: plan.priceInr,
        regularPriceUsd: plan.regularPriceUsd,
        priceUsd: plan.priceUsd,
        isPublished: true,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        durationDays: plan.durationDays,
        regularPriceInr: plan.regularPriceInr,
        priceInr: plan.priceInr,
        regularPriceUsd: plan.regularPriceUsd,
        priceUsd: plan.priceUsd,
        isPublished: true,
      },
    });

    await db.feature.deleteMany({ where: { planId: saved.id } });
    await db.feature.createMany({
      data: plan.features.map((name, index) => ({
        planId: saved.id,
        name,
        position: index + 1,
      })),
    });
  }
}

async function main() {
  await ensureGenderOptions();
  await ensurePlans();
  console.log("Seed complete: base plans and personalization options are ready.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
