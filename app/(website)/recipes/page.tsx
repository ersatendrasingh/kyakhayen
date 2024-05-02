import { GetRecipes } from "@/actions/get-recipes";
import Container from "@/components/container";
import { PageHeader } from "@/components/page-header";
import RecipeCard from "@/components/recipes/recipe-card";
import { db } from "@/lib/db";

const RecipePage = async () => {
  const recipes = await GetRecipes({});

  return (
    <div>
      <PageHeader title="Recipes" className="py-12" />
      <div className="py-12 bg-slate-100">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {recipes.map((recipe, index) => (
              <div key={index} className="m-4">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default RecipePage;
