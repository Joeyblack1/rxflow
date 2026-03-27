import { prisma } from "@/lib/db";
import { PrescriptionStatusBadge } from "@/components/prescriptions/PrescriptionStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { FlaskConical, Clock } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function PharmacyPage({ searchParams }: PageProps) {
  const { date } = await searchParams;

  const queue = await prisma.prescription.findMany({
    where: {
      status: "PENDING_VERIFICATION",
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true, nhsNumber: true },
      },
      prescriber: { select: { name: true, gmcNumber: true } },
      items: {
        include: {
          dmdProduct: {
            select: { name: true, cdSchedule: true, highAlert: true },
          },
        },
      },
    },
    orderBy: { prescribedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="w-6 h-6" />
          Pharmacy Verification Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {queue.length} prescription{queue.length !== 1 ? "s" : ""} awaiting verification
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">Queue is clear</p>
              <p className="text-sm">No prescriptions pending verification</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Drug(s)</TableHead>
                  <TableHead>Prescribed by</TableHead>
                  <TableHead>Prescribed at</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell>
                      <div className="font-medium">
                        {rx.patient.lastName}, {rx.patient.firstName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {rx.patient.nhsNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rx.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.dmdProduct.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{rx.prescriber.name}</div>
                      {rx.prescriber.gmcNumber && (
                        <div className="text-xs text-muted-foreground">
                          GMC: {rx.prescriber.gmcNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(rx.prescribedAt, "HH:mm dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {rx.items.some(
                          (i) => i.dmdProduct.cdSchedule !== "NON_CD"
                        ) && (
                          <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 w-fit">
                            CD
                          </Badge>
                        )}
                        {rx.items.some((i) => i.dmdProduct.highAlert) && (
                          <Badge className="text-xs bg-red-100 text-red-800 border-red-200 w-fit">
                            High Alert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/pharmacy/verify/${rx.id}`}>
                        <Button
                          size="sm"
                          style={{ backgroundColor: "#005EB8", color: "white" }}
                        >
                          Verify
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
