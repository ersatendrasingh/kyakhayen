"use client";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export const ProgressBar = ({ step, totalSteps }: ProgressBarProps) => {
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Ensure this runs only on the client
    setProgressPercentage((step / totalSteps) * 100);
  }, [step, totalSteps]);

  // Render nothing on the server to avoid hydration mismatch
  if (progressPercentage === null) {
    return null;
  }

  // Determine text color based on progress percentage
  const textColor = progressPercentage < 50 ? "text-black" : "text-white";

  return (
    <div className="w-full md:w-[600px] h-6 bg-gray-200 rounded-full mt-4 mb-6 relative">
      <div
        className="h-full bg-red-700 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Apply dynamic text color */}
        <span className={`text-sm ${textColor}`}>
          Step {step} of {totalSteps}
        </span>
      </div>
    </div>
  );
};
