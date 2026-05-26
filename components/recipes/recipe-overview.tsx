import { Preview } from "@/components/preview";
import type { RecipeWithCategory } from "@/types/recipe";

interface RecipeOverviewProps {
  recipe: Pick<RecipeWithCategory, "description" | "title">;
}

const RecipeOverview = ({ recipe }: RecipeOverviewProps) =>
  recipe.description ? (
    <div className="recipe-rich-content recipe-overview-copy rounded-2xl border border-[#eee2d1] bg-[#fbf5ea] p-5 sm:p-7 dark:border-white/8 dark:bg-[#162e27]">
      <Preview
        value={recipe.description}
        className="text-[15px] leading-8 text-[#5e5146] dark:text-[#b3c0b9]"
      />
    </div>
  ) : (
    <p className="rounded-2xl border border-dashed border-[#dfccb0] bg-[#fbf5ea] p-6 text-sm leading-7 text-[#75685c] dark:border-white/10 dark:bg-[#162e27] dark:text-[#b1bdb7]">
      This recipe story is being prepared. Ingredients and steps below are
      ready to help you cook.
    </p>
  );

export default RecipeOverview;
