"use server";

import { db } from "@/lib/db";

import { PrakritiQuestion, PrakritiQuestionOption } from "@prisma/client";
interface PrakritiQuestionType extends PrakritiQuestion {
  options: PrakritiQuestionOption[];
}

export const getPrakritiQuestions = async (): Promise<
  PrakritiQuestionType[]
> => {
  try {
    const prakritiQuestions = await db.prakritiQuestion.findMany({
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
      orderBy: {
        question: "desc",
      },
    });

    return prakritiQuestions;
  } catch (error) {
    console.error("[GET_PRAKRITI_QUESTIONS]", error);
    return [];
  }
};
