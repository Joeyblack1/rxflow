"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  Users,
  FilePlus,
  ClipboardList,
  FlaskConical,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    href: "/patients",
    label: "Patients",
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: "/patients/new",
    label: "New Prescription",
    icon: <FilePlus className="w-4 h-4" />,
    roles: ["PRESCRIBER"],
  },
  {
    href: "/ward",
    label: "Ward MAR",
    icon: <ClipboardList className="w-4 h-4" />,
    roles: ["NURSE"],
  },
  {
    href: "/pharmacy",
    label: "Pharmacy Queue",
    icon: <FlaskConical className="w-4 h-4" />,
    roles: ["PHARMACIST", "PHARMACY_TECHNICIAN"],
  },
  {
    href: "/controlled-drugs",
    label: "Controlled Drugs",
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <Settings className="w-4 h-4" />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];

const roleLabels: Record<UserRole, string> = {
  PRESCRIBER: "Prescriber",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  PHARMACY_TECHNICIAN: "Pharmacy Tech",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  READ_ONLY: "Read Only",
};

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-20"
      style={{ backgroundColor: "#005EB8" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/20">
        <div className="w-7 h-7 bg-white rounded flex items-center justify-center mr-2">
          <span className="text-xs font-bold" style={{ color: "#005EB8" }}>
            Rx
          </span>
        </div>
        <span className="text-white font-bold text-base tracking-wide">
          RxFlow NHS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/20">
        <div className="flex items-start gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#003087", color: "white" }}
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user.name}
            </p>
            <Badge
              className="text-xs mt-0.5 px-1.5 py-0"
              style={{ backgroundColor: "#003087", color: "white", border: "none" }}
            >
              {roleLabels[user.role]}
            </Badge>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-1.5 text-white/75 hover:text-white hover:bg-white/10 rounded text-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
