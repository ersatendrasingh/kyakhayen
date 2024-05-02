import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import PrakritiForm from "./_components/prakriti-form";
const PrakritiPage = async () => {
  const prakriti = await db.prakriti.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <PrakritiForm />
        </div>
        <div>
          <DataTable columns={columns} data={prakriti} />
        </div>
      </div>
    </div>
  );
};

export default PrakritiPage;
