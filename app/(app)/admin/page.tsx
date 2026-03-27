import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  Building2,
  BookOpen,
  Settings,
} from "lucide-react";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.role)) redirect("/dashboard");

  const [userCount, patientCount, todayRxCount] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { isDeceased: false } }),
    prisma.prescription.count({
      where: {
        prescribedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const adminCards = [
    {
      title: "Users",
      description: `${userCount} active users`,
      icon: <Users className="w-6 h-6" />,
      href: "/admin/users",
      colour: "#005EB8",
    },
    {
      title: "Audit Log",
      description: "Full activity history",
      icon: <ClipboardList className="w-6 h-6" />,
      href: "/admin/audit-log",
      colour: "#003087",
    },
    {
      title: "Organisation Settings",
      description: "Configure your organisation",
      icon: <Building2 className="w-6 h-6" />,
      href: "/admin/settings",
      colour: "#009639",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Administration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System administration and configuration
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{userCount}</p>
            <p className="text-sm text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{patientCount}</p>
            <p className="text-sm text-muted-foreground">Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-3xl font-bold">{todayRxCount}</p>
            <p className="text-sm text-muted-foreground">Prescriptions today</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3"
                  style={{ backgroundColor: card.colour }}
                >
                  {card.icon}
                </div>
                <h3 className="font-semibold text-base">{card.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
