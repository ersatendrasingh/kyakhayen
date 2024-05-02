"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RoleGate } from "@/components/auth/role-gate";
import { AdminNavbar } from "./_components/admin-navbar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { UserRole } from "@prisma/client";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUser } from "@/hooks/use-current-user";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const user = useCurrentUser();
  const role = useCurrentRole();

  useEffect(() => {
    // If user is logged in but not admin, redirect to home page
    if (user && role !== UserRole.ADMIN) {
      router.push("/");
    }
  }, [user, role, router]);
  return (
    <div className="h-full">
      <div className="h-[70px] md:pl-64 fixed inset-y-0 w-full z-50 shadow-sm">
        <AdminNavbar />
      </div>
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:inset-y-0 fixed z-50">
        <AdminSidebar />
      </div>
      <main className="md:pl-64 pt-[70px] h-full">
        <RoleGate allowedRole={UserRole.ADMIN}>{children}</RoleGate>
      </main>
    </div>
  );
};

export default AdminLayout;
