"use client";

import { BookA, CalendarDays } from "lucide-react";
import { PiCertificateDuotone } from "react-icons/pi";

interface RecipeUpdateDetailsProps {
  lastUpdateDate: string;
  language: string;
  certificate: string;
}

const RecipeUpdateDetails = ({
  lastUpdateDate,
  language,
  certificate,
}: RecipeUpdateDetailsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start  text-sm text-gray-700 my-6">
      <div className="flex items-center mb-2 md:mb-0 ">
        <CalendarDays className="w-4 h-4 mr-1" />
        <span>Last updated on {lastUpdateDate}</span>
      </div>
      {/* <div className="flex items-center mx-4 md:mb-0 ">
        <BookA className="w-4 h-4 mr-1" />
        <span>{language}</span>
      </div>
      <div className="flex items-center">
        <PiCertificateDuotone className="w-4 h-4 mr-1" />
        <span>{certificate}</span>
      </div> */}
    </div>
  );
};

export default RecipeUpdateDetails;
