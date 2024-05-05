import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import DiseaseForm from "./_components/disease-form";
const DiseasePage = async () => {
  const disease = await db.disease.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <DiseaseForm />
        </div>
        <div>
          <DataTable columns={columns} data={disease} />
        </div>
      </div>
    </div>
  );
};

export default DiseasePage;
