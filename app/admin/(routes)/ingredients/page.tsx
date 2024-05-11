import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
const IngredientsPage = async () => {
  const ingredients = await db.ingredients.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={ingredients} />
    </div>
  );
};

export default IngredientsPage;
