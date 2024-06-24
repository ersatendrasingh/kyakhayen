import { Season } from "@/types/season";
import { db } from "@/lib/db";

export const getSeasonById = async (
  seasonId: string
): Promise<Season | null> => {
  try {
    const season = await db.recipeSeasons.findUnique({
      where: { id: seasonId },
    });
    if (!season) return null;

    // Determine startMonth and endMonth based on season title
    let startMonth: number | undefined;
    let endMonth: number | undefined;

    switch (season.title.toLowerCase()) {
      case "winter":
        startMonth = 12; // December
        endMonth = 2; // February
        break;
      case "spring":
        startMonth = 3; // March
        endMonth = 5; // May
        break;
      case "summer":
        startMonth = 6; // June
        endMonth = 8; // August
        break;
      case "fall":
        startMonth = 9; // September
        endMonth = 11; // November
        break;
      default:
        // For seasons without specific months, assume suitable throughout the year
        startMonth = 1; // January
        endMonth = 12; // December
        break;
    }

    return {
      id: season.id,
      title: season.title,
      startMonth,
      endMonth,
    };
  } catch (error) {
    console.error(
      `[getSeasonById] Error fetching season with ID ${seasonId}:`,
      error
    );
    throw error;
  }
};
