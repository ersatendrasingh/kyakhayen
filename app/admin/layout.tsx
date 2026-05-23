"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RoleGate } from "@/components/auth/role-gate";
import { AdminShell } from "@/components/admin/admin-shell";
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
    <RoleGate allowedRole={UserRole.ADMIN}>
      <AdminShell>{children}</AdminShell>
    </RoleGate>
  );
};

export default AdminLayout;
