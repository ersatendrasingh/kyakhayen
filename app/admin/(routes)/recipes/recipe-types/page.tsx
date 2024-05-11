import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import RecipeTypeForm from "./_components/recipe-type-form";
const RecipeTypePage = async () => {
  const recipeTypes = await db.recipeTypes.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <RecipeTypeForm />
        </div>
        <div>
          <DataTable columns={columns} data={recipeTypes} />
        </div>
      </div>
    </div>
  );
};

export default RecipeTypePage;
