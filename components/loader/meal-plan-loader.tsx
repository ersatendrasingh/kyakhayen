import Image from "next/image";

interface MealPlanLoaderProps {
  isLoading: boolean;
}

const MealPlanLoader = ({ isLoading }: MealPlanLoaderProps) => {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-10 flex items-center justify-center ${
        isLoading ? "" : "hidden"
      }`}
    >
      <div className="bg-gray-900 bg-opacity-50 absolute inset-0"></div>
      <div className="inset-0 flex flex-col items-center justify-center bg-white bg-opacity-100 p-10 rounded-md z-10">
        <Image
          src="/assets/nutrition-plan.gif"
          alt="Loading"
          width={80}
          height={80}
        />
        <p className="mt-2 font-semibold animate-bounce text-websecondary">
          Your meal plan is being generated. Please wait...
        </p>
      </div>
    </div>
  );
};

export default MealPlanLoader;
