"use client";

import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
  BookOpenText,
  CircleUserRound,
  Home,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "@/components/auth/logout-button";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LoginButton } from "@/components/auth/login-button";

export const UserButton = () => {
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const getSessionData = async () => {
      await getSession();
    };

    getSessionData();
  }, []);
  const user = useCurrentUser();
  const pathname = usePathname();
  useEffect(() => {
    if (user?.image) {
      const timestamp = new Date().getTime();
      const imageUrl = user?.image ? `${user.image}?t=${timestamp}` : "";
      setImageUrl(imageUrl);
    }
  }, [user]);

  return (
    <>
      {!user ? (
        <LoginButton>
          <div className="p-2 border-[1px] border-websecondary rounded-full cursor-pointer">
            <CircleUserRound className="h-6 w-6 text-websecondary" />
          </div>
        </LoginButton>
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer border-2 border-websecondary">
                <AvatarImage src={imageUrl} className="w-10 h-10" />
                <AvatarFallback className="bg-websecondary">
                  <FaUser className="text-white" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48" align="end">
              <Link href="/user/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/user/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserRound className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
              </Link>

              <Link href="/user/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <ExitIcon className="h-4 w-4 mr-2" />

                <LogoutButton callbackUrl={pathname}>Logout</LogoutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </>
  );
};
