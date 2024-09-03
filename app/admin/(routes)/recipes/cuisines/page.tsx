import { db } from "@/lib/db";

import CuisineForm from "./_components/cuisine-form";
import CuisinesTable from "./_components/cuisines-table";
const CuisinesPage = async () => {
  const cuisines = await db.cuisines.findMany({
    orderBy: {
      position: "asc",
    },
    include: {
      _count: {
        select: {
          recipeCuisine: true,
        },
      },
    },
  });
  const cuisinesWithRecipeCount = cuisines.map((cuisine) => ({
    ...cuisine,
    totalRecipeCount: cuisine._count.recipeCuisine,
  }));

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <CuisineForm />
        </div>
        <div>
          <CuisinesTable initialCuisines={cuisinesWithRecipeCount} />
        </div>
      </div>
    </div>
  );
};

export default CuisinesPage;
