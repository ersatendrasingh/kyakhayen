const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");

// const countrySeedData = require("../seedData/countrySeedData.json");
// const stateSeedData = require("../seedData/stateSeedData.json");
// const citySeedData = require("../seedData/citySeedData.json");

const database = new PrismaClient();

// const seed = async () => {
//   try {
//     await database.Gender.createMany({
//       // data: [
//       //   { title: "Fall" },
//       //   { title: "Winter" },
//       //   { title: "Summer" },
//       //   { title: "Spring" },
//       //   { title: "Suitable throughout the year" },
//       // ],
//       data: [
//         { title: "Male", position: 1 },
//         { title: "Female", position: 2 },
//       ],
//     });
//     console.log("successfully seeded recipe difficulties");
//   } catch (error) {
//     console.log("Error while seeding recipe difficulties: ", error);
//   } finally {
//     await database.$disconnect();
//   }
// };

// seed();

// async function generateCountrySeedData() {
//   try {
//     // Fetch countries data from your database using Prisma
//     const countries = await database.country.findMany();

//     // Format the data as per your requirement
//     const countrySeedData = countries.map((country) => ({
//       name: country.name,
//       countryCode: country.countryCode,
//       capital: country.capital || null,
//       region: country.region || null,
//       flag: country.flag || null,
//       currency: country.currency || null,
//       phoneCode: country.phoneCode || null,
//     }));

//     // Write the seed data to a JSON file
//     await fs.writeFile(
//       "seedData/countrySeedData.json",
//       JSON.stringify(countrySeedData, null, 2)
//     );
//     console.log("Country seed data generated successfully.");
//   } catch (error) {
//     console.error("Error generating country seed data:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

// async function generateStateSeedData() {
//   try {
//     // Fetch states data from your database using Prisma
//     const states = await database.state.findMany();

//     // Format the data as per your requirement
//     const stateSeedData = states.map((state) => ({
//       name: state.name,
//       stateCode: state.stateCode,
//       countryId: state.countryId,
//     }));

//     // Write the seed data to a JSON file
//     await fs.writeFile(
//       "seedData/stateSeedData.json",
//       JSON.stringify(stateSeedData, null, 2)
//     );
//     console.log("State seed data generated successfully.");
//   } catch (error) {
//     console.error("Error generating state seed data:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

// async function generateCitySeedData() {
//   try {
//     // Fetch cities data from your database using Prisma
//     const cities = await database.city.findMany();

//     // Format the data as per your requirement
//     const citySeedData = cities.map((city) => ({
//       name: city.name,
//       stateId: city.stateId, // Assuming you have a stateId field in the city table
//     }));

//     // Write the seed data to a JSON file
//     await fs.writeFile(
//       "seedData/citySeedData.json",
//       JSON.stringify(citySeedData, null, 2)
//     );
//     console.log("City seed data generated successfully.");
//   } catch (error) {
//     console.error("Error generating city seed data:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

// async function main() {
//   await generateCountrySeedData();
//   await generateStateSeedData();
//   await generateCitySeedData();
// }
//seedDatabase();
//main();
// function slugify(title) {
//   return title
//     .toLowerCase()
//     .replace(/[^\w\s-]/g, "")
//     .replace(/[\s]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }
// async function main() {
//   try {
//     // Fetch data from app_recipes
//     const appRecipes = await database.app_recipes.findMany();

//     // Set to track existing slugs
//     const existingSlugs = new Set(
//       (await database.Recipes.findMany()).map((recipe) => recipe.slug)
//     );

//     // Prepare data for insertion
//     const recipes = await Promise.all(
//       appRecipes.map(async (appRecipe) => {
//         const slug = await slugify(appRecipe.name);
//         return {
//           title: appRecipe.name,
//           slug,
//         };
//       })
//     );

//     // Insert data into recipes
//     await database.Recipes.createMany({
//       data: recipes,
//       skipDuplicates: true, // Skip duplicates if any
//     });

//     console.log("Seed completed successfully.");
//   } catch (error) {
//     console.error("Error seeding the database:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

// main();

// async function seedDatabase() {
//   try {
//     await database.Country.createMany({
//       data: countrySeedData,
//     });

//     await database.State.createMany({
//       data: stateSeedData,
//     });

//     await database.City.createMany({
//       data: citySeedData,
//     });

//     console.log("Seed data inserted successfully.");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

//seedDatabase();

// async function insertSampleData() {
//   try {
//     // Inserting plans with associated features
//     const plansWithFeatures = await database.$transaction([
//       // Insert Freemium Plan
//       database.plan.create({
//         data: {
//           name: "Freemium",
//           durationMonths: 0, // Indicating it's a free plan
//           priceInr: 0,
//           priceUsd: 0,
//           features: {
//             create: [
//               { name: "Limited recipes access" },
//               { name: "Basic meal planning" },
//             ],
//           },
//         },
//       }),

//       // Insert Bronze Plan
//       database.plan.create({
//         data: {
//           name: "Bronze",
//           durationMonths: 1,
//           priceInr: 99,
//           priceUsd: 1.99,
//           features: {
//             create: [
//               { name: "Full recipes access" },
//               { name: "Standard meal planning" },
//               { name: "Email support" },
//             ],
//           },
//         },
//       }),

//       // Insert Silver Plan
//       database.plan.create({
//         data: {
//           name: "Silver",
//           durationMonths: 3,
//           priceInr: 249,
//           priceUsd: 4.99,
//           features: {
//             create: [
//               { name: "Premium recipes access" },
//               { name: "Advanced meal planning" },
//               { name: "Priority email support" },
//               { name: "Weekly nutrition tips" },
//             ],
//           },
//         },
//       }),

//       // Insert Gold Plan
//       database.plan.create({
//         data: {
//           name: "Gold",
//           durationMonths: 6,
//           priceInr: 499,
//           priceUsd: 7.99,
//           features: {
//             create: [
//               { name: "VIP recipes access" },
//               { name: "Customized meal planning" },
//               { name: "24/7 VIP support" },
//               { name: "Personalized nutrition consultation" },
//               { name: "Exclusive cooking classes" },
//             ],
//           },
//         },
//       }),
//       // Insert Platinum Plan
//       database.plan.create({
//         data: {
//           name: "Platinum",
//           durationMonths: 12,
//           priceInr: 999,
//           priceUsd: 14.99,
//           features: {
//             create: [
//               { name: "VIP recipes access" },
//               { name: "Customized meal planning" },
//               { name: "24/7 VIP support" },
//               { name: "Personalized nutrition consultation" },
//               { name: "Exclusive cooking classes" },
//             ],
//           },
//         },
//       }),
//     ]);

//     console.log("Inserted plans with features:", plansWithFeatures);
//   } catch (error) {
//     console.error("Error inserting data:", error);
//   } finally {
//     await database.$disconnect();
//   }
// }

//insertSampleData();

async function assignPlanToUser(userId, planId, startDate, endDate) {
  try {
    const userPlan = await database.userPlan.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
      },
    });

    console.log(`Assigned plan ${planId} to user ${userId}:`, userPlan);
    return userPlan;
  } catch (error) {
    console.error("Error assigning plan to user:", error);
    throw error;
  }
}
async function assignFreePlanToUser(userId) {
  try {
    const freePlan = await database.plan.findFirst({
      where: { name: "Freemium" }, // Adjust this condition to match your free plan
    });

    if (!freePlan) {
      throw new Error("Free plan not found");
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Assuming the free plan lasts 1 month

    const userPlan = await assignPlanToUser(
      userId,
      freePlan.id,
      startDate,
      endDate
    );
    console.log(`Assigned free plan to user ${userId}`);
    return userPlan;
  } catch (error) {
    console.error("Error assigning free plan to user:", error);
    throw error;
  }
}
async function assignPlansToExistingUsers() {
  try {
    const users = await database.user.findMany(); // Fetch all users
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      // Check if user already has a plan assigned
      const userPlan = await database.userPlan.findFirst({
        where: { userId: user.id },
      });

      if (!userPlan) {
        console.log(`Assigning free plan to user ${user.id}`);
        await assignFreePlanToUser(user.id);
      } else {
        console.log(`User ${user.id} already has a plan.`);
      }
    }

    console.log("Plan assignment to existing users completed.");
  } catch (error) {
    console.error("Error in assigning plans:", error);
  } finally {
    await database.$disconnect();
  }
}
assignPlansToExistingUsers();
