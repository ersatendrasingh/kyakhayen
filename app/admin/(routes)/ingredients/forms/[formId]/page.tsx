import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { FormNameFormForm } from "./_components/form-name-form";
import { FormActions } from "./_components/form-actions";

const IngredientFormIdPage = async ({
  params,
}: {
  params: { formId: string };
}) => {
  const ingredientsForm = await db.ingredientsForm.findUnique({
    where: {
      id: params.formId,
    },
  });

  if (!ingredientsForm) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Edit Ingredient Form</h1>
          </div>
          <FormActions formId={params.formId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Category</h2>
            </div>
            <FormNameFormForm
              initialData={ingredientsForm}
              formId={ingredientsForm.id}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default IngredientFormIdPage;
