import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";

import CategoryForm from "./_components/category-form";
const ArticleCategoriesPage = async () => {
  const categories = await db.category.findMany({
    orderBy: {
      title: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CategoryForm />
        </div>
        <div>
          <DataTable columns={columns} data={categories} />
        </div>
      </div>
    </div>
  );
};

export default ArticleCategoriesPage;
