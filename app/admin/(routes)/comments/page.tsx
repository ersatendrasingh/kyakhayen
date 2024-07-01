import { db } from "@/lib/db";

import CommentsTable from "./_components/comments-table";
const CommentsPage = async () => {
  const comments = await db.comment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <CommentsTable comments={comments} />
    </div>
  );
};

export default CommentsPage;
