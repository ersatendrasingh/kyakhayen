import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
const ContactQueriesPage = async () => {
  const queries = await db.contactUsQueries.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={queries} />
    </div>
  );
};

export default ContactQueriesPage;
