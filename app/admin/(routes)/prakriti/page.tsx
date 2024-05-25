import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { db } from "@/lib/db";
const PrakritiQuestionsPage = async () => {
  const prakritiQuestions = await db.prakritiQuestion.findMany({
    include: {
      options: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      question: "asc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={prakritiQuestions} />
    </div>
  );
};

export default PrakritiQuestionsPage;
