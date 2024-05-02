"use client";

import { ListChecks } from "lucide-react";

interface CourseDetailsContentProps {
  technologyRequirement: string;
  eligibility: string;
  disclaimer: string;
}

const CourseDetailsContent = ({
  technologyRequirement,
  eligibility,
  disclaimer,
}: CourseDetailsContentProps) => {
  return (
    <div className="w-full items-start justify-start">
      <h3 className="text-xl font-bold mb-3">Technology Requirements</h3>
      <div className="flex items-center text-lg font-semibold border rounded-md border-gray-200 p-6 mb-4 w-full">
        <ListChecks size={24} className="text-sky-700 mr-2" />
        <span>{technologyRequirement}</span>
      </div>
      <h3 className="text-xl font-bold mb-3">Eligibility Requirements</h3>
      <div className="flex items-center text-lg font-semibold border rounded-md border-gray-200 p-6 mb-4 w-full">
        <ListChecks size={24} className="text-sky-700 mr-2" />
        <span>{eligibility}</span>
      </div>

      <h3 className="text-xl font-bold mb-3">Disclaimer</h3>
      <div className="flex items-center text-lg font-semibold border rounded-md border-gray-200 p-6 mb-4 w-full">
        <ListChecks size={24} className="text-sky-700 mr-2" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};

export default CourseDetailsContent;
