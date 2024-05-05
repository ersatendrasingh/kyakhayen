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
import { RecipeCookingMethodForm } from "./_components/recipe-cooking-method-form";
import { RecipeAllergyForm } from "./_components/recipe-allergy-form";
import { RecipePrakritiForm } from "./_components/recipe-prakriti-form";
import { RecipeHealthGoalForm } from "./_components/recipe-health-goal-form";
import { RecipeDiseaseForm } from "./_components/recipe-disease-form";
import { RecipeMealTimeForm } from "./_components/recipe-meal-time-form";
import { RecipeNutrientForm } from "./_components/recipe-nutrient-form";
import { RecipeDietTypeForm } from "./_components/recipe-diet-type-form";
import { RecipeNutritionValuesForm } from "./_components/recipe-nutrition-values-form";

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
      recipeNutritionValues: true,
      recipeCuisine: {
        include: {
          cuisine: true,
        },
      },
      recipeCookingMethods: {
        include: {
          cookingMethod: true,
        },
      },
      recipeAllergies: {
        include: {
          allergies: true,
        },
      },
      recipePrakriti: {
        include: {
          prakriti: true,
        },
      },
      recipeHealthGoals: {
        include: {
          healthGoals: true,
        },
      },
      recipeDisease: {
        include: {
          disease: true,
        },
      },
      recipeMealTime: {
        include: {
          mealTime: true,
        },
      },
      recipeNutrient: {
        include: {
          nutrient: true,
        },
      },
      recipeDietType: {
        include: {
          dietType: true,
        },
      },
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
  const cookingMethods = await db.cookingMethods.findMany();
  const allergies = await db.allergies.findMany();
  const prakritis = await db.prakriti.findMany();
  const healthGoals = await db.healthGoals.findMany();
  const diseases = await db.disease.findMany();
  const mealTimes = await db.mealTimes.findMany();
  const nutrients = await db.nutrient.findMany();
  const dietTypes = await db.dietTypes.findMany();

  const cuisinesData = recipe.recipeCuisine.map((cuisine) => ({
    id: cuisine.id,
    recipeId: recipe.id,
    cuisineId: cuisine.cuisineId,
    cuisine: {
      id: cuisine.cuisine.id,
      title: cuisine.cuisine.title,
      slug: cuisine.cuisine.slug,
      imageUrl: cuisine.cuisine.imageUrl,
    },
  }));
  const cookingMethodsData = recipe.recipeCookingMethods.map(
    (cookingMethod) => ({
      id: cookingMethod.id,
      recipeId: recipe.id,
      cookingMethodId: cookingMethod.cookingMethodId,
      cookingMethod: {
        id: cookingMethod.cookingMethod.id,
        title: cookingMethod.cookingMethod.title,
        slug: cookingMethod.cookingMethod.slug,
        imageUrl: cookingMethod.cookingMethod.imageUrl,
      },
    })
  );
  const allergiesData = recipe.recipeAllergies.map((allergy) => ({
    id: allergy.id,
    recipeId: recipe.id,
    allergyId: allergy.allergyId,
    allergy: {
      id: allergy.allergies.id,
      title: allergy.allergies.title,
      slug: allergy.allergies.slug,
      imageUrl: allergy.allergies.imageUrl,
    },
  }));
  const prakritiData = recipe.recipePrakriti.map((prakriti) => ({
    id: prakriti.id,
    recipeId: recipe.id,
    prakritiId: prakriti.prakritiId,
    prakriti: {
      id: prakriti.prakriti.id,
      title: prakriti.prakriti.title,
      slug: prakriti.prakriti.slug,
      imageUrl: prakriti.prakriti.imageUrl,
    },
  }));
  const healthGoalData = recipe.recipeHealthGoals.map((healthGoal) => ({
    id: healthGoal.id,
    recipeId: recipe.id,
    healthGoalId: healthGoal.healthGoalId,
    healthGoal: {
      id: healthGoal.healthGoals.id,
      title: healthGoal.healthGoals.title,
      slug: healthGoal.healthGoals.slug,
      imageUrl: healthGoal.healthGoals.imageUrl,
    },
  }));
  const diseaseData = recipe.recipeDisease.map((disease) => ({
    id: disease.id,
    recipeId: recipe.id,
    diseaseId: disease.diseaseId,
    disease: {
      id: disease.disease.id,
      title: disease.disease.title,
      slug: disease.disease.slug,
      imageUrl: disease.disease.imageUrl,
    },
  }));
  const mealTimeData = recipe.recipeMealTime.map((mealTime) => ({
    id: mealTime.id,
    recipeId: recipe.id,
    mealTimeId: mealTime.mealTimeId,
    mealTime: {
      id: mealTime.mealTime.id,
      title: mealTime.mealTime.title,
      slug: mealTime.mealTime.slug,
      imageUrl: mealTime.mealTime.imageUrl,
    },
  }));
  const nutrientData = recipe.recipeNutrient.map((nutrient) => ({
    id: nutrient.id,
    recipeId: recipe.id,
    nutrientId: nutrient.nutrientId,
    nutrient: {
      id: nutrient.nutrient.id,
      title: nutrient.nutrient.title,
      slug: nutrient.nutrient.slug,
      imageUrl: nutrient.nutrient.imageUrl,
    },
  }));
  const dietTypeData = recipe.recipeDietType.map((dietType) => ({
    id: dietType.id,
    recipeId: recipe.id,
    dietTypeId: dietType.dietTypeId,
    dietType: {
      id: dietType.dietType.id,
      title: dietType.dietType.title,
      slug: dietType.dietType.slug,
      imageUrl: dietType.dietType.imageUrl,
    },
  }));

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

            <RecipeTimeForm initialData={recipe} recipeId={recipe.id} />
            <RecipeNutritionValuesForm
              initialData={recipe}
              recipeId={recipe.id}
            />
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
              <div className="flex items-center mt-4 gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Recipe Tags</h2>
              </div>
              <CuisinesForm
                initialData={cuisinesData}
                recipeId={recipe.id}
                options={cuisines.map((cuisine) => ({
                  label: cuisine.title,
                  value: cuisine.id,
                }))}
              />
              <RecipeCookingMethodForm
                initialData={cookingMethodsData}
                recipeId={recipe.id}
                options={cookingMethods.map((cookingMethod) => ({
                  label: cookingMethod.title,
                  value: cookingMethod.id,
                }))}
              />
              <RecipeAllergyForm
                initialData={allergiesData}
                recipeId={recipe.id}
                options={allergies.map((allergy) => ({
                  label: allergy.title,
                  value: allergy.id,
                }))}
              />
              <RecipePrakritiForm
                initialData={prakritiData}
                recipeId={recipe.id}
                options={prakritis.map((prakriti) => ({
                  label: prakriti.title,
                  value: prakriti.id,
                }))}
              />
              <RecipeHealthGoalForm
                initialData={healthGoalData}
                recipeId={recipe.id}
                options={healthGoals.map((healthGoal) => ({
                  label: healthGoal.title,
                  value: healthGoal.id,
                }))}
              />
              <RecipeDiseaseForm
                initialData={diseaseData}
                recipeId={recipe.id}
                options={diseases.map((disease) => ({
                  label: disease.title,
                  value: disease.id,
                }))}
              />
              <RecipeMealTimeForm
                initialData={mealTimeData}
                recipeId={recipe.id}
                options={mealTimes.map((mealTime) => ({
                  label: mealTime.title,
                  value: mealTime.id,
                }))}
              />
              <RecipeNutrientForm
                initialData={nutrientData}
                recipeId={recipe.id}
                options={nutrients.map((nutrient) => ({
                  label: nutrient.title,
                  value: nutrient.id,
                }))}
              />
              <RecipeDietTypeForm
                initialData={dietTypeData}
                recipeId={recipe.id}
                options={dietTypes.map((dietType) => ({
                  label: dietType.title,
                  value: dietType.id,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeIdPage;
