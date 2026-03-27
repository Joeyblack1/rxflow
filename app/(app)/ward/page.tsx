import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WardPage() {
  const session = await getSession();

  const wards = await prisma.ward.findMany({
    where: { isActive: true },
    include: {
      beds: {
        include: {
          admissions: {
            where: { isActive: true },
            include: {
              patient: {
                include: {
                  allergies: { where: { status: "ACTIVE", severity: { in: ["ANAPHYLAXIS", "SEVERE"] } } },
                  prescriptions: {
                    where: { status: "ACTIVE" },
                    include: {
                      items: { include: { dmdProduct: { select: { name: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Count due/overdue doses per patient
  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BedDouble className="w-6 h-6" />
          Ward Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all beds and active patients
        </p>
      </div>

      {wards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BedDouble className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No wards configured</p>
            <p className="text-sm">Contact your administrator to set up wards</p>
          </CardContent>
        </Card>
      ) : (
        wards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {ward.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({ward.code})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {ward.beds.map((bed) => {
                  const admission = bed.admissions[0];
                  const patient = admission?.patient;

                  return (
                    <div
                      key={bed.id}
                      className={`border rounded-lg p-3 text-sm ${
                        patient ? "bg-white" : "bg-gray-50 border-dashed"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        Bed {bed.bedNumber}
                      </div>
                      {patient ? (
                        <div>
                          <Link href={`/patients/${patient.id}`}>
                            <p className="font-medium hover:underline cursor-pointer text-xs">
                              {patient.lastName}, {patient.firstName}
                            </p>
                          </Link>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.allergies.length > 0 && (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            {patient.prescriptions.length > 0 && (
                              <Badge className="text-xs px-1 py-0 bg-blue-100 text-blue-700">
                                {patient.prescriptions.reduce(
                                  (sum, rx) => sum + rx.items.length,
                                  0
                                )}{" "}
                                meds
                              </Badge>
                            )}
                          </div>
                          <Link href={`/patients/${patient.id}/mar`}>
                            <Button
                              variant="ghost"
                              className="text-xs px-0 h-auto mt-1 text-blue-600"
                              size="sm"
                            >
                              View MAR →
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Empty</p>
                      )}
                    </div>
                  );
                })}
                {ward.beds.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No beds configured for this ward
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
