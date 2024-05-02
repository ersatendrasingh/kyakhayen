import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
import UnitsForm from "./_components/units-form";
const UnitsPage = async () => {
  const units = await db.units.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <UnitsForm />
        </div>
        <div>
          <DataTable columns={columns} data={units} />
        </div>
      </div>
    </div>
  );
};

export default UnitsPage;
