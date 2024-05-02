import { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface MenuItemProps {
  id: number;
  label: string;
  href: string;
}

interface AdminSidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  subMenuItems?: MenuItemProps[];
}

export const AdminSidebarItem = ({
  label,
  href,
  icon: Icon,
  subMenuItems,
}: AdminSidebarItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive =
    (pathname === "/" && href === "/dashboard") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const handleCloseSubMenu = () => {
    setIsSubMenuOpen(false);
  };
  const handleSubMenuToggle = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <div>
      <Link
        href={subMenuItems ? "" : href}
        className={cn(
          "flex items-center gap-x-2 text-sm font-[500] pl-6 transition-all text-websecondary hover:bg-websecondary-100 hover:text-white cursor-pointer",
          isActive &&
            "bg-websecondary text-white hover:bg-websecondary-foreground hover:text-white border-r-4 border-webprimary"
        )}
        onClick={() => {
          if (subMenuItems) {
            handleSubMenuToggle();
          } else {
            handleCloseSubMenu();
          }
        }}
      >
        <div className="flex items-center gap-x-2 py-4">
          <Icon size={22} />
          <span>{label}</span>
        </div>
        {subMenuItems && (
          <div className="ml-auto">
            <ChevronDown className="h-5 w-5" />
          </div>
        )}
      </Link>
      {isSubMenuOpen && subMenuItems && (
        <div className="bg-gray-100">
          {subMenuItems.map((menuItem) => (
            <Link
              key={menuItem.id}
              href={menuItem.href}
              className={cn(
                "flex items-center gap-x-2 text-sm font-[500] pl-6 transition-all text-websecondary hover:bg-websecondary-100 py-4 hover:text-white",
                pathname === menuItem.href &&
                  "bg-webprimary text-white border-r-4 border-websecondary"
              )}
            >
              {menuItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
