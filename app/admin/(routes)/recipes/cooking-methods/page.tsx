import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import CookingMethodForm from "./_components/cooking-method-form";
const CookingMethodsPage = async () => {
  const cookingMethod = await db.cookingMethods.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CookingMethodForm />
        </div>
        <div>
          <DataTable columns={columns} data={cookingMethod} />
        </div>
      </div>
    </div>
  );
};

export default CookingMethodsPage;
