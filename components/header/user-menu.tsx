"use client";

import { UserButton } from "@/components/auth/user-button";

const Usermenu = () => {
  return (
    <div className="flex flex-row items-center gap-3">
      <div className="flex flex-row items-center rounded-full cursor-pointer transition">
        <UserButton />
      </div>
    </div>
  );
};

export default Usermenu;
