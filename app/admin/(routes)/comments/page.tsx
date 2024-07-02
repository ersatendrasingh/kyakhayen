import { db } from "@/lib/db";
import CommentsTable from "./_components/comments-table";
import { CommentWithRelations } from "@/types/comment";

const CommentsPage = async () => {
  const comments: CommentWithRelations[] = await db.comment.findMany({
    include: {
      user: true,
      recipe: true,
      Post: true,
    },
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
