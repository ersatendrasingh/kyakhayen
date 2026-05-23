"use client";

import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
  CircleDollarSign,
  CircleUserRound,
  Home,
  Settings,
  UserRound,
  WheatOff,
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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const user = useCurrentUser();
  const pathname = usePathname();

  // Fetch session once on component mount
  useEffect(() => {
    const getSessionData = async () => {
      const session = await getSession();
      if (session?.user?.image) {
        const timestamp = new Date().getTime();
        setImageUrl(`${session.user.image}?t=${timestamp}`);
      }
    };

    getSessionData();
  }, []);

  // Update imageUrl when user.image changes
  useEffect(() => {
    if (user?.image) {
      const timestamp = new Date().getTime();
      setImageUrl(`${user.image}?t=${timestamp}`);
    }
  }, [user?.image]);
  if (!user) {
    return (
      <LoginButton>
        <div className="p-2 border-[1px] border-websecondary rounded-full cursor-pointer">
          <CircleUserRound className="h-6 w-6 text-websecondary" />
        </div>
      </LoginButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer border-2 border-websecondary">
          <AvatarImage
            src={imageUrl}
            alt={user.name || "Avatar"}
            className="w-10 h-10"
          />
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
        <Link href="/user/subscriptions">
          <DropdownMenuItem className="cursor-pointer">
            <CircleDollarSign className="h-4 w-4 mr-2" />
            My Subscriptions
          </DropdownMenuItem>
        </Link>
        <Link href="/user/preferences">
          <DropdownMenuItem className="cursor-pointer">
            <WheatOff className="h-4 w-4 mr-2" />
            My Preferences
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
  );
};
