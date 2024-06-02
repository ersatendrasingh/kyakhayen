import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
const ArticlesPage = async () => {
  const articles = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={articles} />
    </div>
  );
};

export default ArticlesPage;
