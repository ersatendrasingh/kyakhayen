"use client";

import {
  Boxes,
  Home,
  LogOut,
  Settings,
  UserRound,
  WheatOff,
} from "lucide-react";
import { usePathname } from "next/navigation";

import MenuItem from "./menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { capitalizeName } from "@/lib/formateName";

const userMenu = [
  {
    name: "Dashboard",
    href: "/user/dashboard",
    menuIcon: Home,
  },
  {
    name: "My Profile",
    href: "/user/profile",
    menuIcon: UserRound,
  },
  {
    name: "My Wellness Summary",
    href: "/user/wellness-summary",
    menuIcon: Boxes,
  },
  {
    name: "My Preferences",
    href: "/user/preferences",
    menuIcon: WheatOff,
  },
  {
    name: "Settings",
    href: "/user/settings",
    menuIcon: Settings,
  },
  {
    name: "Logout",
    href: "/user/logout",
    menuIcon: LogOut,
  },
];

const StickySidebar = () => {
  const user = useCurrentUser();
  const pathname = usePathname();
  return (
    <div className="sticky z-10 w-full top-20 mx-auto sm:px-2 px-4 bg-white rounded-md transition shadow-md">
      <div className=" p-4 right-0 overflow-y-auto">
        <div className="mb-4">
          <div className="mx-auto w-full flex border-b pb-3 pl-1">
            {user?.name ? (
              <h1 className="text-2xl font-bold">
                Welcome, {capitalizeName(user?.name)}
              </h1>
            ) : (
              <Skeleton className="h-4 w-full rounded-xl" />
            )}
          </div>
          {userMenu.map((item) => (
            <MenuItem
              key={item.name}
              label={item.name}
              href={item.href}
              menuIcon={item.menuIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickySidebar;
