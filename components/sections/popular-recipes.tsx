import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import RecipeCard from "@/components/recipes/recipe-card";

const PopularRecipes = async () => {
  const recipes = await GetRecipes({});

  return (
    <div className="w-full flex items-center justify-center pt-12 pb-10 mt-10 mb-10 bg-[#f9f9ff]">
      <Container>
        <h3 className="text-3xl font-bold text-center text-websecondary mb-10">
          Popular Recipes For You
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="m-4">
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default PopularRecipes;
