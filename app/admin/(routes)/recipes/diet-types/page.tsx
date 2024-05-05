import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import DietTypeForm from "./_components/diet-type-form";
const DietTypePage = async () => {
  const dietTypes = await db.dietTypes.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <DietTypeForm />
        </div>
        <div>
          <DataTable columns={columns} data={dietTypes} />
        </div>
      </div>
    </div>
  );
};

export default DietTypePage;
