import { currentUser } from "@/lib/auth";
import ChangePassword from "../_components/change-password";
import Tabs from "../_components/tabs";
import UserProfile from "../_components/user-profile";
import { getGender } from "@/actions/get-gender";
import { db } from "@/lib/db";

const SettingsPage = async () => {
  const user = await currentUser();
  if (!user) return;
  const userDetails = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      gender: true,
    },
  });
  const genders = await getGender({
    userId: user?.id,
  });

  const prakritiQuestions = await db.prakritiQuestion.findMany({
    include: {
      options: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const tabs = [
    {
      label: "User Profile",
      content: (
        <UserProfile
          userData={userDetails}
          genders={genders}
          prakritiQuestions={prakritiQuestions}
        />
      ),
    },
  ];

  // Conditionally add the "Change Password" tab
  if (!user.isOAuth) {
    tabs.push({
      label: "Change Password",
      content: <ChangePassword />,
    });
  }
  return (
    <div className="bg-white rounded-md shadow-sm transition p-4">
      <h1 className="text-3xl font-bold border-b-2 border-slate-200 pb-2 text-gray-700">
        Settings
      </h1>
      <div className="flex flex-col justify-between w-full py-10">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default SettingsPage;
