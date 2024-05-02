import Logo from "@/components/logo";
import { AdminSidebarRoutes } from "./admin-sidebar-routes";

export const AdminSidebar = () => {
  return (
    <div className="flex flex-col h-full border-r shadow-sm overflow-y-auto bg-[#fff5d5] text-websecondary font-semibold">
      <div className="border-b p-4">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <AdminSidebarRoutes />
      </div>
    </div>
  );
};
