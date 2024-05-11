import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
import UnitsForm from "./_components/ingredients-form-form";
import IngredientsFormForm from "./_components/ingredients-form-form";

const IngredientsForm = async () => {
  const ingredientsForm = await db.ingredientsForm.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <IngredientsFormForm />
        </div>
        <div>
          <DataTable columns={columns} data={ingredientsForm} />
        </div>
      </div>
    </div>
  );
};

export default IngredientsForm;
