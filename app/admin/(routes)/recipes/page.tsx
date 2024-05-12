import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
const RecipesPage = async () => {
  const recipes = await db.recipes.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={recipes} />
    </div>
  );
};

export default RecipesPage;
