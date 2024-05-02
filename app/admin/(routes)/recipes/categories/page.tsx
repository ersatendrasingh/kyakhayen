import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
import RecipeCategoryForm from "./_components/recipe-category-form";
const CategoriesPage = async () => {
  const recipeCategories = await db.recipeCategories.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <RecipeCategoryForm />
        </div>
        <div>
          <DataTable columns={columns} data={recipeCategories} />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
