"use client";

import { ListChecks } from "lucide-react";

const CourseCareer = () => {
  return (
    <div className="w-full items-start justify-start">
      <h3 className="text-xl font-bold mb-3">
        Personal Nutrition Course opens the doors to a range of career prospects
        such as:
      </h3>
      <div className="flex items-center text-lg font-semibold border rounded-md border-gray-200 p-6 mb-4 w-full">
        <ListChecks size={24} className="text-sky-700 mr-2" />
        <span>
          The Personal Nutrition Course is meant for providing nutritional
          knowledge for self and family.
        </span>
      </div>
    </div>
  );
};

export default CourseCareer;
