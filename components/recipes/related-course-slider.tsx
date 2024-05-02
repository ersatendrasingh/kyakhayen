"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CourseCard from "@/components/courses/course-card";
import CourseContainer from "@/components/courses/course-container";
import { Categories, Courses } from "@prisma/client";

type CourseWithProgressWithCategory = Courses & {
  category: Categories | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface RelatedCourseProps {
  relatedCourses: CourseWithProgressWithCategory[];
}

const RelatedCourseSlider = ({ relatedCourses }: RelatedCourseProps) => {
  return (
    <div className="w-full mt-8 ">
      <CourseContainer>
        <div className="bg-white p-4 rounded-md shadow-sm transition">
          <h2 className="text-2xl font-bold mb-4">Related Courses</h2>
        </div>
        <div className="w-full mt-5 relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-sm"
          >
            <CarouselContent>
              {relatedCourses.map((course, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <CourseCard course={course} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 transform -translate-y-1/2 left-2 cursor-pointer" />
            <CarouselNext className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer" />
          </Carousel>
        </div>
      </CourseContainer>
    </div>
  );
};

export default RelatedCourseSlider;
