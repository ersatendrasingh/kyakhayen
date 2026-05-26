import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const description = `
<h2>Crisp outside, soft paneer inside</h2>
<p>Paneer Kabab is a warmly spiced, pan-seared starter with a golden crust and a tender centre. Fresh ginger, green chilli and coriander brighten the paneer mixture, while a small amount of breadcrumb keeps each kabab delicate but easy to shape.</p>
<h3>Why you will love it</h3>
<ul>
  <li>Pan-seared with very little oil for a crisp finish.</li>
  <li>Ready for evening snacks, party platters or a protein-rich side.</li>
  <li>Easy to shape ahead and cook just before serving.</li>
</ul>
<blockquote><p>Chef tip: chill the shaped kababs briefly before cooking. They hold their shape better and develop a beautiful golden crust.</p></blockquote>
<h3>Serving ideas</h3>
<p>Serve hot with mint-coriander chutney, sliced onions and a squeeze of lemon. For a fuller meal, tuck the kababs into a roti wrap with crunchy salad and yogurt dip.</p>
`.trim();

const steps = [
  {
    title: "Prepare the paneer mixture",
    description:
      "<p>Crumble the paneer into a mixing bowl. Add breadcrumbs, ginger, garlic, onion, green chilli, turmeric, chilli powder, salt and coriander leaves.</p><p>Mix gently until everything is evenly distributed. Do not overwork the paneer or the kababs can become dense.</p>",
  },
  {
    title: "Shape and rest the kababs",
    description:
      "<p>Divide the mixture into equal portions and shape into small flat discs. Press the edges neatly so they do not crack while cooking.</p><p>Rest in the refrigerator for <strong>10 minutes</strong> to firm up.</p>",
  },
  {
    title: "Pan-sear until golden",
    description:
      "<p>Heat sunflower oil in a non-stick pan over medium heat. Place the kababs in a single layer and cook for 3 to 4 minutes on each side until evenly golden and crisp.</p>",
  },
  {
    title: "Finish and serve hot",
    description:
      "<p>Lift the kababs onto a serving plate and serve immediately with green chutney and lemon wedges. They are best enjoyed hot while the crust is crisp.</p>",
  },
];

const testUsers = [
  { name: "Ananya Mehta", email: "ananya.test@kyakhayen.local" },
  { name: "Rohan Kapoor", email: "rohan.test@kyakhayen.local" },
  { name: "Maya Sharma", email: "maya.test@kyakhayen.local" },
];

async function main() {
  const recipe = await db.recipes.findUnique({ where: { slug: "paneer-kabab" } });
  if (!recipe) {
    throw new Error("Paneer Kabab recipe was not found.");
  }

  const salt = await db.ingredients.findUnique({ where: { slug: "salt-table" } });
  if (!salt) {
    throw new Error("Published Salt, table ingredient was not found.");
  }

  const users = await Promise.all(
    testUsers.map((user) =>
      db.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: user,
      }),
    ),
  );
  const seededUserIds = users.map((user) => user.id);

  await db.$transaction(async (tx) => {
    await tx.recipes.update({
      where: { id: recipe.id },
      data: {
        description,
        metaTitle: "Paneer Kabab Recipe | Crisp Paneer Starter",
        metaDescription:
          "Make crisp, golden Paneer Kabab with fresh spices and simple pan-searing steps. A protein-rich starter ready for chutney and lemon.",
      },
    });

    await tx.recipeCookingTime.upsert({
      where: { recipeId: recipe.id },
      update: { prepTime: 20, cookTime: 12, restTime: 10 },
      create: {
        recipeId: recipe.id,
        prepTime: 20,
        cookTime: 12,
        restTime: 10,
      },
    });

    await tx.recipeIngredients.updateMany({
      where: {
        recipeId: recipe.id,
        ingredient: { slug: "rock-salt" },
      },
      data: { ingredientId: salt.id },
    });

    await tx.recipeMethods.deleteMany({ where: { recipeId: recipe.id } });
    await tx.recipeMethods.createMany({
      data: steps.map((step, index) => ({
        recipeId: recipe.id,
        title: step.title,
        description: step.description,
        position: index + 1,
        isPublished: true,
      })),
    });

    await tx.review.deleteMany({
      where: { recipeId: recipe.id, userId: { in: seededUserIds } },
    });
    await tx.review.createMany({
      data: [
        {
          recipeId: recipe.id,
          userId: users[0].id,
          rating: 5,
          comment:
            "Crisp on the outside and really soft inside. The 10 minute resting tip helped the kababs stay together beautifully.",
          isPublished: true,
        },
        {
          recipeId: recipe.id,
          userId: users[1].id,
          rating: 4,
          comment:
            "Lovely evening snack. I served it with mint chutney and lemon; the spice level was balanced for the family.",
          isPublished: true,
        },
      ],
    });

    await tx.comment.deleteMany({
      where: { recipeId: recipe.id, userId: { in: seededUserIds } },
    });
    const question = await tx.comment.create({
      data: {
        recipeId: recipe.id,
        userId: users[2].id,
        content:
          "Can these kababs be shaped in advance and refrigerated before pan-searing?",
        isPublished: true,
        isPrimary: true,
        likes: 2,
      },
    });
    await tx.comment.create({
      data: {
        recipeId: recipe.id,
        userId: users[0].id,
        parentCommentId: question.id,
        content:
          "Yes. I shaped them a few hours ahead, covered the tray, and cooked just before serving. They held perfectly.",
        isPublished: true,
        isPrimary: false,
      },
    });
    await tx.comment.create({
      data: {
        recipeId: recipe.id,
        userId: users[1].id,
        content:
          "A little squeeze of lemon after cooking makes the coriander and chilli flavours pop.",
        isPublished: true,
        isPrimary: true,
        likes: 1,
      },
    });
  });

  console.log("Paneer Kabab showcase content, nutrition mapping and community data seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
