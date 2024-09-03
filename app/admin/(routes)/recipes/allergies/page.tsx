import { db } from "@/lib/db";

import AllergyForm from "./_components/allergy-form";
import AllergiesTable from "./_components/allergies-table";
const AllergiesPage = async () => {
  const allergies = await db.allergies.findMany({
    orderBy: {
      position: "asc",
    },
    include: {
      _count: {
        select: {
          recipeAllergies: true,
        },
      },
    },
  });
  const allergiesWithRecipeCount = allergies.map((allergy) => ({
    ...allergy,
    totalRecipeCount: allergy._count.recipeAllergies,
  }));
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <AllergyForm />
        </div>
        <div>
          <AllergiesTable initialAllergies={allergiesWithRecipeCount} />
        </div>
      </div>
    </div>
  );
};

export default AllergiesPage;
