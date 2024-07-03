import { db } from "@/lib/db";

import { ReviewWithRelations } from "@/types/review";
import ReviewsTable from "./_components/reviews-table";

const ReviewsPage = async () => {
  const reviews: ReviewWithRelations[] = await db.review.findMany({
    include: {
      user: true,
      recipe: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <ReviewsTable reviews={reviews} />
    </div>
  );
};

export default ReviewsPage;
