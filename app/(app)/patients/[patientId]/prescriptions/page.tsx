import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PrescriptionStatusBadge } from "@/components/prescriptions/PrescriptionStatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { FilePlus } from "lucide-react";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientPrescriptionsPage({ params }: PageProps) {
  const { patientId } = await params;
  const session = await getSession();

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) notFound();

  const activePrescriptions = await prisma.prescription.findMany({
    where: {
      patientId,
      status: { in: ["ACTIVE", "PENDING_VERIFICATION", "DRAFT", "SUSPENDED"] },
    },
    include: {
      items: { include: { dmdProduct: true } },
      prescriber: { select: { name: true } },
      pharmacist: { select: { name: true } },
    },
    orderBy: { prescribedAt: "desc" },
  });

  const historicalPrescriptions = await prisma.prescription.findMany({
    where: {
      patientId,
      status: { in: ["DISCONTINUED", "COMPLETED", "EXPIRED"] },
    },
    include: {
      items: { include: { dmdProduct: true } },
      prescriber: { select: { name: true } },
    },
    orderBy: { prescribedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prescriptions</h2>
        {session?.role === "PRESCRIBER" && (
          <Link href={`/patients/${patientId}/prescriptions/new`}>
            <Button style={{ backgroundColor: "#005EB8", color: "white" }} size="sm">
              <FilePlus className="w-4 h-4 mr-1" />
              New Prescription
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active / Current</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activePrescriptions.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4">No active prescriptions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Prescriber</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePrescriptions.map((rx) =>
                  rx.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.dmdProduct.name}
                        {item.dmdProduct.cdSchedule !== "NON_CD" && (
                          <span className="ml-2 text-xs text-purple-700 font-medium">
                            CD
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{item.dose}</TableCell>
                      <TableCell>{item.route}</TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell className="text-sm">{rx.prescriber.name}</TableCell>
                      <TableCell className="text-sm">
                        {format(rx.prescribedAt, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <PrescriptionStatusBadge status={rx.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {historicalPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Historical ({historicalPrescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Prescriber</TableHead>
                  <TableHead>Prescribed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalPrescriptions.map((rx) =>
                  rx.items.map((item) => (
                    <TableRow key={item.id} className="opacity-70">
                      <TableCell>{item.dmdProduct.name}</TableCell>
                      <TableCell>{item.dose}</TableCell>
                      <TableCell className="text-sm">{rx.prescriber.name}</TableCell>
                      <TableCell className="text-sm">
                        {format(rx.prescribedAt, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <PrescriptionStatusBadge status={rx.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
