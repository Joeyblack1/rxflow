import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default async function ControlledDrugsPage() {
  // Get all active CD prescriptions
  const cdPrescriptions = await prisma.prescription.findMany({
    where: {
      status: "ACTIVE",
      cdSchedule: { not: "NON_CD" },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, nhsNumber: true } },
      prescriber: { select: { name: true } },
      pharmacist: { select: { name: true } },
      items: {
        include: {
          dmdProduct: { select: { name: true, cdSchedule: true } },
          marEntries: {
            where: { outcome: "GIVEN" },
            orderBy: { administeredAt: "desc" },
            take: 1,
            include: {
              administeredBy: { select: { name: true } },
              witnessedBy: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { prescribedAt: "desc" },
  });

  const cdScheduleLabel: Record<string, string> = {
    SCHEDULE_2: "Schedule 2",
    SCHEDULE_3: "Schedule 3",
    SCHEDULE_4_PART1: "Schedule 4 (Part I)",
    SCHEDULE_4_PART2: "Schedule 4 (Part II)",
    SCHEDULE_5: "Schedule 5",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Controlled Drugs Register
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all active controlled drug prescriptions
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {cdPrescriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active controlled drug prescriptions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Administered</TableHead>
                  <TableHead>Last Witness</TableHead>
                  <TableHead>Verified by</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cdPrescriptions.map((rx) =>
                  rx.items
                    .filter((item) => item.dmdProduct.cdSchedule !== "NON_CD")
                    .map((item) => {
                      const lastAdmin = item.marEntries[0];
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium text-sm">
                              {rx.patient.lastName}, {rx.patient.firstName}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {rx.patient.nhsNumber}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.dmdProduct.name}
                            <div className="text-xs text-muted-foreground">
                              {item.dose} · {item.frequency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                              {cdScheduleLabel[item.dmdProduct.cdSchedule] ??
                                item.dmdProduct.cdSchedule}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lastAdmin?.administeredAt ? (
                              <>
                                <div>{format(lastAdmin.administeredAt, "HH:mm")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(lastAdmin.administeredAt, "dd/MM/yyyy")}
                                </div>
                                {lastAdmin.administeredBy && (
                                  <div className="text-xs text-muted-foreground">
                                    by {lastAdmin.administeredBy.name}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lastAdmin?.witnessedBy?.name ?? (
                              <span className="text-red-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                None recorded
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {rx.pharmacist?.name ?? (
                              <span className="text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
