import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItemProps {
  label: string;
  href: string;
  menuIcon?: LucideIcon;
}

const MenuItem = ({ label, href, menuIcon: Icon }: MenuItemProps) => {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <>
      {label !== "Logout" ? (
        <>
          <Link
            href={href}
            className={cn(
              "flex items-center gap-x-2 text-sm  pl-1 transition-all text-slate-700 hover:bg-sky-500/10 hover:text-sky-700 font-bold",
              isActive && " text-rose-500  hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-x-2 py-4">
              {Icon && (
                <Icon
                  size={18}
                  className={cn("text-slate-500", isActive && "text-rose-500")}
                />
              )}
              {label}
            </div>
          </Link>
          <Separator />
        </>
      ) : (
        <>
          <div className="flex items-center gap-x-2 text-sm  pl-1 transition-all text-slate-700 hover:bg-sky-500/10 hover:text-sky-700 font-bold py-4">
            {Icon && (
              <Icon
                size={18}
                className={cn("text-slate-500", isActive && "text-rose-500")}
              />
            )}

            <LogoutButton callbackUrl={pathname}>Logout</LogoutButton>
          </div>
        </>
      )}
    </>
  );
};

export default MenuItem;
