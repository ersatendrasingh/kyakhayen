import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
import IngredientCategoryForm from "./_components/ingredient-category-form";
const IngredientCategoriesPage = async () => {
  const ingredientCategories = await db.ingredientCategories.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <IngredientCategoryForm />
        </div>
        <div>
          <DataTable columns={columns} data={ingredientCategories} />
        </div>
      </div>
    </div>
  );
};

export default IngredientCategoriesPage;
