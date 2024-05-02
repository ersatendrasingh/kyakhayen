import { AdminMobileSidebar } from "./admin-mobile-sidebar";
import { AdminNavbarRoutes } from "./admin-navbar-routes";

export const AdminNavbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-[#fff5d5]">
      <AdminMobileSidebar />
      <AdminNavbarRoutes />
    </div>
  );
};
