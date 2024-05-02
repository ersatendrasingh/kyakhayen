"use client";

import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { Home, LogOut, Settings, ShoppingBag, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExitIcon } from "@radix-ui/react-icons";
import { LogoutButton } from "./logout-button";
import { usePathname } from "next/navigation";

export const UserButton = () => {
  const pathname = usePathname();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer border-2 border-sky-500">
            <AvatarImage src="" className="w-10 h-10" />
            <AvatarFallback className="bg-sky-500">
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

          <Link href="/user/orders">
            <DropdownMenuItem className="cursor-pointer">
              <ShoppingBag className="h-4 w-4 mr-2" />
              My Orders
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
  );
};
