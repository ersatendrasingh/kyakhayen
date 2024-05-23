import { LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

import { TitleForm } from "./_components/title-form";

import { Banner } from "@/components/banner";
import { QuestionActions } from "./_components/question-actions";

import { OptionsForm } from "./_components/options-form";

const PrakritiIdPage = async ({
  params,
}: {
  params: { prakritiId: string };
}) => {
  const prakritiQuestion = await db.prakritiQuestion.findUnique({
    where: {
      id: params.prakritiId,
    },
    include: {
      options: {
        include: {
          parkriti: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!prakritiQuestion) {
    return redirect("/");
  }

  const prakritis = await db.prakriti.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const requiredFields = [
    prakritiQuestion.question,
    prakritiQuestion.options.length >= 3,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!prakritiQuestion.isPublished && (
        <Banner
          variant="warning"
          label="This question is unpublished. It will not be visible to the public."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Prakriti Question Setup</h1>
            <span className="text-sm text-slate-700">
              Complete the all required fields {completedText}
            </span>
          </div>
          <QuestionActions
            disabled={!isComplete}
            prakritiId={params.prakritiId}
            isPublished={prakritiQuestion.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize Question</h2>
            </div>
            <TitleForm
              initialData={prakritiQuestion}
              prakritiId={prakritiQuestion.id}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center mt-4 md:mt-0 gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Options</h2>
              </div>
              <OptionsForm
                initialData={prakritiQuestion}
                prakritiId={prakritiQuestion.id}
                options={prakritis.map((prakriti) => ({
                  label: prakriti.title,
                  value: prakriti.id,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrakritiIdPage;
