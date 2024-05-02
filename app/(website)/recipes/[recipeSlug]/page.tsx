import { getRecipeBySlug } from "@/actions/get-recipe";

import BannerCard from "@/components/recipes/banner-card";
import RecipeDetails from "@/components/recipes/recipe-details";

//import RelatedCourseSlider from "@/components/courses/related-course-slider";
import StickySidebar from "@/components/recipes/sticky-sidebar";
import { currentUser } from "@/lib/auth";
import { RecipeCategories, RecipeIngredients, Recipes } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
type RecipeWithCategory = Recipes & {
  RecipeCategories: RecipeCategories;
  recipeIngredients: RecipeIngredients[];
};
const SingleRecipePage = async ({
  params,
}: {
  params: { recipeSlug: string };
}) => {
  const slug = params.recipeSlug;

  const user = await currentUser();
  if (!user) {
    const userId = undefined;
  }

  const userId = user?.id;

  //const relatedCourses = await getCourses({});

  const recipe = await getRecipeBySlug({ recipeSlug: slug as string });

  if (!recipe) {
    throw new Error("Recipe not found");
  }
  const { id, title, imageUrl } = recipe;

  const courseDataSendToCart = {
    id,
    title,

    imageUrl,
    quantity: 1,
    type: "recipe",
    slug,
  };
  return (
    <div className="w-full bg-slate-100 pb-8">
      <div className=" flex flex-col lg:flex-row">
        <div className="w-full lg:w-4/6">
          <BannerCard
            recipe={recipe}
            className="py-10 lg:py-8 mb-7 md:mb-2 xl:mb-2"
          />
          <RecipeDetails recipe={recipe} />
        </div>
        <div className="w-full lg:w-2/6 lg:pr-20">
          <StickySidebar recipe={recipe} cartItems={courseDataSendToCart} />
        </div>
      </div>
      {/* <RelatedCourseSlider relatedCourses={relatedCourses} /> */}
    </div>
  );
};

export default SingleRecipePage;
