import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import CuisineForm from "./_components/cuisine-form";
const CuisinesPage = async () => {
  const cusines = await db.cuisines.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CuisineForm />
        </div>
        <div>
          <DataTable columns={columns} data={cusines} />
        </div>
      </div>
    </div>
  );
};

export default CuisinesPage;
