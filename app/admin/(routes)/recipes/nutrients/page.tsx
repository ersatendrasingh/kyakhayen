import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import NutrientForm from "./_components/nutrient-form";
const NutrientsPage = async () => {
  const nutrient = await db.nutrient.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <NutrientForm />
        </div>
        <div>
          <DataTable columns={columns} data={nutrient} />
        </div>
      </div>
    </div>
  );
};

export default NutrientsPage;
