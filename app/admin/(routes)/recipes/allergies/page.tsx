import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import AllergyForm from "./_components/allergy-form";
const CookingMethodsPage = async () => {
  const allergies = await db.allergies.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <AllergyForm />
        </div>
        <div>
          <DataTable columns={columns} data={allergies} />
        </div>
      </div>
    </div>
  );
};

export default CookingMethodsPage;
