import { db } from "@/lib/db";
import { Attachements, Chapters } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseSlug: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseSlug,
  chapterId,
}: GetChapterProps) => {
  try {
    const course = await db.courses.findUnique({
      where: {
        isPublished: true,
        slug: courseSlug,
      },
      select: {
        id: true,
        price: true,
      },
    });
    const courseId = course?.id;
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: courseId as string,
        },
      },
    });

    const chapter = await db.chapters.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: Attachements[] = [];
    let nextChapter: Chapters | null = null;

    if (purchase) {
      attachments = await db.attachements.findMany({
        where: {
          courseId: courseId,
        },
      });
    }

    if (chapter.isFree || purchase) {
      muxData = await db.muxData.findUnique({
        where: {
          chapterId: chapterId,
        },
      });

      nextChapter = await db.chapters.findFirst({
        where: {
          courseId: courseId,
          isPublished: true,
          position: {
            gt: chapter?.position,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
