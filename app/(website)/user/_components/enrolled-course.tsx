import { getCourses } from "@/actions/get-courses";
import CourseCard from "@/components/courses/course-card";
import { Categories, Courses } from "@prisma/client";
import { useEffect, useState } from "react";

type CourseWithProgressWithCategory = Courses & {
  category: Categories | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface EnrolledCourseProps {
  courses: CourseWithProgressWithCategory;
}

const EnrolledCourses = () => {
  const [courses, setCourses] = useState<CourseWithProgressWithCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCourses({});
        console.log("Courses from enrolled course: ", { coursesData });
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchData();
  }, []);
  console.log("Courses from enrolled course: ", { courses });
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start">
      {courses.map((course, index) => (
        <div key={index} className="m-4">
          <CourseCard course={course} />
        </div>
      ))}
    </div>
  );
};

export default EnrolledCourses;
