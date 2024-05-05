const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");

// const countrySeedData = require("../seedData/countrySeedData.json");
// const stateSeedData = require("../seedData/stateSeedData.json");
// const citySeedData = require("../seedData/citySeedData.json");

const database = new PrismaClient();

const seed = async () => {
  try {
    await database.RecipeDifficulty.createMany({
      // data: [
      //   { title: "Fall" },
      //   { title: "Winter" },
      //   { title: "Summer" },
      //   { title: "Spring" },
      //   { title: "Suitable throughout the year" },
      // ],
      data: [
        { title: "Beginner" },
        { title: "Intermediate" },
        { title: "Advanced" },
      ],
    });
    console.log("successfully seeded recipe difficulties");
  } catch (error) {
    console.log("Error while seeding recipe difficulties: ", error);
  } finally {
    await database.$disconnect();
  }
};

seed();

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
