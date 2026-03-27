import { Bell, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";

interface TopBarProps {
  user: {
    name: string;
    role: UserRole;
  };
  orgName?: string;
}

const roleLabels: Record<UserRole, string> = {
  PRESCRIBER: "Prescriber",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  PHARMACY_TECHNICIAN: "Pharmacy Tech",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  READ_ONLY: "Read Only",
};

export function TopBar({ user, orgName }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="w-4 h-4" />
        <span>{orgName ?? "Bassetlaw Community Mental Health Team"}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {user.name}
          <span className="ml-1 text-xs text-gray-400">
            ({roleLabels[user.role]})
          </span>
        </span>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
