import { Preview } from "@/components/preview";
import { hasInternalSeoCopy } from "@/lib/seo";
import type { RecipeWithCategory } from "@/types/recipe";

interface RecipeOverviewProps {
  recipe: Pick<RecipeWithCategory, "description" | "title">;
}

function demoteEmbeddedHeadings(value: string) {
  return value.replace(
    /<\/?h([1-6])([^>]*)>/gi,
    (match, level: string, attrs: string) => {
      const nextLevel = Number(level) <= 2 ? 3 : Math.min(6, Number(level) + 1);
      return match.startsWith("</") ? `</h${nextLevel}>` : `<h${nextLevel}${attrs}>`;
    },
  );
}

const RecipeOverview = ({ recipe }: RecipeOverviewProps) => {
  const description =
    recipe.description && !hasInternalSeoCopy(recipe.description)
      ? demoteEmbeddedHeadings(recipe.description)
      : "";

  return description ? (
    <div className="recipe-rich-content recipe-overview-copy rounded-2xl border border-[#eee2d1] bg-[#fbf5ea] p-5 sm:p-7 dark:border-white/8 dark:bg-[#162e27]">
      <Preview
        value={description}
        className="text-[15px] leading-8 text-[#5e5146] dark:text-[#b3c0b9]"
      />
    </div>
  ) : (
    <p className="rounded-2xl border border-dashed border-[#dfccb0] bg-[#fbf5ea] p-6 text-sm leading-7 text-[#75685c] dark:border-white/10 dark:bg-[#162e27] dark:text-[#b1bdb7]">
      This recipe story is being prepared. Ingredients and steps below are
      ready to help you cook.
    </p>
  );
};

export default RecipeOverview;
