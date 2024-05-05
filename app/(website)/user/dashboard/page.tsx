import AnimatedNumber from "@/components/animated-number";
import { Award, BookOpenText, MonitorCheck } from "lucide-react";

const UserDashboard = async () => {
  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-3xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Dashboard
      </h1>
      <div className="flex flex-col md:flex-row md:justify-between py-10">
        <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-md shadow-md transition h-[300px] flex flex-col items-center justify-center">
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <BookOpenText className="text-3xl text-white w-10 h-10" />
            </div>
            <AnimatedNumber value={15} />

            <p className="text-sm text-white">Recipes Views</p>
          </div>
        </div>
        <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
          <div className="h-[300px] bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-md shadow-md transition flex flex-col items-center justify-center">
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <MonitorCheck className="text-3xl text-white w-10 h-10" />
            </div>
            <AnimatedNumber value={5} />

            <p className="text-sm text-white">Active Recipes</p>
          </div>
        </div>
        <div className="w-full md:w-1/3 mx-2 text-center">
          <div className="h-[300px] bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-md shadow-md transition flex flex-col items-center justify-center">
            <div className="bg-gray-200/20 w-24 h-24 rounded-full p-4 flex items-center justify-center mb-8">
              <Award className="text-3xl text-white w-10 h-10 " />
            </div>
            <AnimatedNumber value={10} />

            <p className="text-sm text-white">Watch Recipes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
