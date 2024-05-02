import {
  BadgeIndianRupeeIcon,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
// import { PriceForm } from "./_components/price-form";
// import { AttachmentForm } from "./_components/attachment-form";
// import { ChapterForm } from "./_components/chapter-form";
import { Banner } from "@/components/banner";
import { RecipeActions } from "./_components/recipe-actions";
import { IngredientsForm } from "./_components/ingredients-form";
import { MethodsForm } from "./_components/methods-form";
import { DifficultyForm } from "./_components/difficulty-form";
import { RecipeTimeForm } from "./_components/recipe-time-form";
import { SeasonsForm } from "./_components/seasons-form";
import { CuisinesForm } from "./_components/cuisines-form";

// import { FAQForm } from "./_components/faq-form";
// import { CourseDetailsForm } from "./_components/course-details-form";
// import { CourseMetaDataForm } from "./_components/course-meta-data-form";
// import { FacultyAssignForm } from "./_components/faculty-assign-form";

const RecipeIdPage = async ({ params }: { params: { recipeId: string } }) => {
  const recipe = await db.recipes.findUnique({
    where: {
      id: params.recipeId,
    },
    include: {
      recipeIngredients: {
        include: {
          unit: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      recipeMethods: {
        orderBy: {
          position: "asc",
        },
      },
      recipeCookingTime: true,
    },
  });

  if (!recipe) {
    return redirect("/");
  }

  const categories = await db.recipeCategories.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const units = await db.units.findMany({ orderBy: { title: "asc" } });

  const difficultyLavels = await db.recipeDifficulty.findMany();
  const seasons = await db.recipeSeasons.findMany();
  const cuisines = await db.cuisines.findMany();

  const requiredFields = [
    recipe.title,
    recipe.description,
    recipe.imageUrl,
    //recipe.price,
    //recipe.categoryId,
    //recipe.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!recipe.isPublished && (
        <Banner
          variant="warning"
          label="This recipe is unpublished. It will not be visible to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Recipe Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <RecipeActions
            disabled={!isComplete}
            recipeId={params.recipeId}
            isPublished={recipe.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Recipe</h2>
            </div>
            <TitleForm initialData={recipe} recipeId={recipe.id} />
            <DescriptionForm initialData={recipe} recipeId={recipe.id} />
            <ImageForm initialData={recipe} recipeId={recipe.id} />
            <CategoryForm
              initialData={recipe}
              recipeId={recipe.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
            <DifficultyForm
              initialData={recipe}
              recipeId={recipe.id}
              options={difficultyLavels.map((difficultyLavel) => ({
                label: difficultyLavel.title,
                value: difficultyLavel.id,
              }))}
            />
            <SeasonsForm
              initialData={recipe}
              recipeId={recipe.id}
              options={seasons.map((season) => ({
                label: season.title,
                value: season.id,
              }))}
            />
            <CuisinesForm
              initialData={recipe}
              recipeId={recipe.id}
              options={cuisines.map((cuisine) => ({
                label: cuisine.title,
                value: cuisine.id,
              }))}
            />
            <RecipeTimeForm initialData={recipe} recipeId={recipe.id} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Recipe Ingredients</h2>
              </div>
              <IngredientsForm
                initialData={recipe}
                recipeId={recipe.id}
                options={units.map((unit) => ({
                  title: unit.title,
                  shortName: unit.shortName,
                  value: unit.id,
                }))}
              />
              <div className="flex items-center mt-4 gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Recipe Methods</h2>
              </div>
              <MethodsForm initialData={recipe} recipeId={recipe.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeIdPage;
