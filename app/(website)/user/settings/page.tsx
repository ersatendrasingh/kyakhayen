"use client";

import ChangePassword from "../_components/change-password";
import Tabs from "../_components/tabs";
import UserProfile from "../_components/user-profile";

const SettingsPage = () => {
  const tabs = [
    {
      label: "User Profile",
      content: <UserProfile />,
    },
    {
      label: "Change Password",
      content: <ChangePassword />,
    },
  ];
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
