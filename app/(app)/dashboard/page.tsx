import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [totalPatients, activePrescriptions, pendingVerification, recentAudit] =
    await Promise.all([
      prisma.patient.count({ where: { isDeceased: false } }),
      prisma.prescription.count({ where: { status: "ACTIVE" } }),
      prisma.prescription.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
        include: {
          user: { select: { name: true } },
          patient: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  // Overdue doses: MAR entries scheduled in past with no outcome
  const now = new Date();
  const overdueDoses = await prisma.mAREntry.count({
    where: {
      scheduledAt: { lt: now },
      outcome: null,
    },
  });

  // Role-specific data
  let roleContent = null;

  if (session.role === "PRESCRIBER") {
    const myRecent = await prisma.prescription.findMany({
      where: { prescriberId: session.id },
      take: 5,
      orderBy: { prescribedAt: "desc" },
      include: {
        patient: { select: { firstName: true, lastName: true, nhsNumber: true } },
        items: { include: { dmdProduct: { select: { name: true } } } },
      },
    });
    roleContent = (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Recent Prescriptions</CardTitle>
          <Link href="/patients">
            <Button size="sm" style={{ backgroundColor: "#005EB8", color: "white" }}>
              <Plus className="w-4 h-4 mr-1" />
              New Prescription
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myRecent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No prescriptions yet</p>
          ) : (
            <div className="space-y-2">
              {myRecent.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {rx.patient.firstName} {rx.patient.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rx.items.map((i) => i.dmdProduct.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={rx.status === "ACTIVE" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {rx.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(rx.prescribedAt, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } else if (session.role === "PHARMACIST") {
    const queue = await prisma.prescription.findMany({
      where: { status: "PENDING_VERIFICATION" },
      take: 5,
      orderBy: { prescribedAt: "asc" },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        prescriber: { select: { name: true } },
        items: { include: { dmdProduct: { select: { name: true } } } },
      },
    });
    roleContent = (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-muted-foreground text-sm">Queue is clear</p>
          ) : (
            <div className="space-y-2">
              {queue.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {rx.patient.firstName} {rx.patient.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rx.items.map((i) => i.dmdProduct.name).join(", ")} — by {rx.prescriber.name}
                    </p>
                  </div>
                  <Link href={`/pharmacy/verify/${rx.id}`}>
                    <Button size="sm" variant="outline">
                      Verify
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } else if (session.role === "NURSE") {
    const dueSoon = await prisma.mAREntry.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 60 * 60 * 1000),
        },
        outcome: null,
      },
      take: 10,
      include: {
        prescriptionItem: {
          include: {
            dmdProduct: { select: { name: true } },
            prescription: {
              include: {
                patient: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    roleContent = (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doses Due in Next Hour</CardTitle>
        </CardHeader>
        <CardContent>
          {dueSoon.length === 0 ? (
            <p className="text-muted-foreground text-sm">No doses due soon</p>
          ) : (
            <div className="space-y-2">
              {dueSoon.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {entry.prescriptionItem.prescription.patient.firstName}{" "}
                      {entry.prescriptionItem.prescription.patient.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.prescriptionItem.dmdProduct.name} —{" "}
                      {entry.prescriptionItem.dose}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {format(entry.scheduledAt, "HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: <Users className="w-5 h-5" />,
      color: "#005EB8",
    },
    {
      label: "Active Prescriptions",
      value: activePrescriptions,
      icon: <FileText className="w-5 h-5" />,
      color: "#009639",
    },
    {
      label: "Pending Verification",
      value: pendingVerification,
      icon: <Clock className="w-5 h-5" />,
      color: "#FFB81C",
    },
    {
      label: "Overdue Doses",
      value: overdueDoses,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "#DA291C",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session.name}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleContent}

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAudit.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentAudit.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {log.action.replace(/_/g, " ")}
                        {log.patient
                          ? ` — ${log.patient.firstName} ${log.patient.lastName}`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user?.name ?? "System"} ·{" "}
                        {format(log.timestamp, "dd/MM HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
