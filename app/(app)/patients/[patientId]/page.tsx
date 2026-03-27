import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNHSNumber } from "@/lib/nhs";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrescriptionStatusBadge } from "@/components/prescriptions/PrescriptionStatusBadge";
import { AlertTriangle, User, MapPin, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientOverviewPage({ params }: PageProps) {
  const { patientId } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: { where: { status: "ACTIVE" }, orderBy: { severity: "desc" } },
      prescriptions: {
        where: { status: { in: ["ACTIVE", "PENDING_VERIFICATION", "DRAFT"] } },
        include: {
          items: { include: { dmdProduct: { select: { name: true, cdSchedule: true, highAlert: true } } } },
          prescriber: { select: { name: true } },
        },
        orderBy: { prescribedAt: "desc" },
      },
    },
  });

  if (!patient) notFound();

  const severityColour: Record<string, string> = {
    ANAPHYLAXIS: "bg-red-100 text-red-800 border-red-200",
    SEVERE: "bg-orange-100 text-orange-800 border-orange-200",
    MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    MILD: "bg-gray-100 text-gray-800 border-gray-200",
    UNKNOWN: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Demographics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">NHS Number</span>
            <span className="font-mono font-medium">
              {formatNHSNumber(patient.nhsNumber)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date of Birth</span>
            <span>{format(patient.dateOfBirth, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sex</span>
            <span>{patient.sex}</span>
          </div>
          {patient.weightKg && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight</span>
              <span>{patient.weightKg} kg</span>
            </div>
          )}
          {patient.renalFunction && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renal Function</span>
              <span>{patient.renalFunction}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address & GP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address &amp; GP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {patient.addressLine1 ? (
            <address className="not-italic text-gray-700">
              {patient.addressLine1}
              {patient.addressLine2 && (
                <>
                  <br />
                  {patient.addressLine2}
                </>
              )}
              {patient.city && (
                <>
                  <br />
                  {patient.city}
                </>
              )}
              {patient.postcode && (
                <>
                  <br />
                  {patient.postcode}
                </>
              )}
            </address>
          ) : (
            <p className="text-muted-foreground">No address recorded</p>
          )}
          {patient.gpName && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs">GP</p>
              <p>{patient.gpName}</p>
              {patient.gpPracticeOdsCode && (
                <p className="text-xs text-muted-foreground">
                  ODS: {patient.gpPracticeOdsCode}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Allergies &amp; Intolerances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.allergies.length === 0 ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              No known allergies
            </Badge>
          ) : (
            <div className="space-y-2">
              {patient.allergies.map((a) => (
                <div
                  key={a.id}
                  className={`p-2 rounded border text-xs ${severityColour[a.severity]}`}
                >
                  <span className="font-semibold">{a.substanceName}</span>
                  <span className="ml-2 opacity-70">
                    {a.severity} · {a.allergyType}
                  </span>
                  {a.reactionType && (
                    <p className="mt-0.5 opacity-70">{a.reactionType}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link href={`/patients/${patientId}/allergies`}>
            <Button variant="link" size="sm" className="px-0 mt-2">
              Manage allergies →
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Active medications */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Active Medications
            </CardTitle>
            <Link href={`/patients/${patientId}/prescriptions/new`}>
              <Button size="sm" style={{ backgroundColor: "#005EB8", color: "white" }}>
                + New Prescription
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {patient.prescriptions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active prescriptions
              </p>
            ) : (
              <div className="space-y-3">
                {patient.prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="border rounded-lg p-3 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      {rx.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {item.dmdProduct.name}
                          </span>
                          {item.dmdProduct.highAlert && (
                            <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                              HIGH ALERT
                            </Badge>
                          )}
                          {item.dmdProduct.cdSchedule !== "NON_CD" && (
                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                              CD {item.dmdProduct.cdSchedule}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {item.dose} · {item.route} · {item.frequency}
                          </span>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Prescribed by {rx.prescriber.name} on{" "}
                        {format(rx.prescribedAt, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <PrescriptionStatusBadge status={rx.status} />
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
