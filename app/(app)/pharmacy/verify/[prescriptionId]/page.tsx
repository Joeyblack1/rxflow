"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { verifyPrescription, discontinuePrescription } from "@/lib/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect } from "react";

interface Prescription {
  id: string;
  status: string;
  prescribedAt: string;
  startDate: string;
  indication: string | null;
  clinicalNotes: string | null;
  cdSchedule: string;
  items: Array<{
    id: string;
    dose: string;
    route: string;
    frequency: string;
    dmdProduct: {
      name: string;
      cdSchedule: string;
      highAlert: boolean;
      formulation: string | null;
      strengthText: string | null;
    };
  }>;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nhsNumber: string;
    dateOfBirth: string;
    allergies: Array<{
      id: string;
      substanceName: string;
      severity: string;
      allergyType: string;
    }>;
  };
  prescriber: { name: string; gmcNumber: string | null };
}

interface PageProps {
  params: Promise<{ prescriptionId: string }>;
}

export default function VerifyPrescriptionPage({ params }: PageProps) {
  const { prescriptionId } = use(params);
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, []);

  async function loadPrescription() {
    setLoading(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}`);
      if (res.ok) {
        const data = await res.json();
        setPrescription(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const result = await verifyPrescription(prescriptionId, notes || undefined);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Prescription verified and activated");
        router.push("/pharmacy");
      }
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setRejecting(true);
    try {
      const result = await discontinuePrescription(prescriptionId, rejectReason);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Prescription discontinued");
        router.push("/pharmacy");
      }
    } finally {
      setRejecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading prescription…
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <p>Prescription not found</p>
        <Link href="/pharmacy">
          <Button variant="link">Back to queue</Button>
        </Link>
      </div>
    );
  }

  const hasHighAlert = prescription.items.some((i) => i.dmdProduct.highAlert);
  const hasCDs = prescription.items.some((i) => i.dmdProduct.cdSchedule !== "NON_CD");

  const allergyConflicts = prescription.patient.allergies.filter((a) =>
    prescription.items.some((item) =>
      item.dmdProduct.name.toLowerCase().includes(a.substanceName.toLowerCase()) ||
      a.substanceName.toLowerCase().includes(item.dmdProduct.name.toLowerCase().split(" ")[0])
    )
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pharmacy">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Queue
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Verify Prescription</h1>
      </div>

      {/* Patient info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-semibold">
                {prescription.patient.lastName}, {prescription.patient.firstName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">NHS Number</p>
              <p className="font-mono">{prescription.patient.nhsNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p>{format(new Date(prescription.patient.dateOfBirth), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {hasHighAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>HIGH ALERT MEDICATION — Extra vigilance required</AlertDescription>
        </Alert>
      )}

      {allergyConflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            POSSIBLE ALLERGY CONFLICT: Patient has recorded allergy to{" "}
            {allergyConflicts.map((a) => a.substanceName).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Allergies */}
      {prescription.patient.allergies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Patient Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prescription.patient.allergies.map((a) => (
                <Badge
                  key={a.id}
                  className={`text-xs ${
                    a.severity === "ANAPHYLAXIS"
                      ? "bg-red-100 text-red-800"
                      : a.severity === "SEVERE"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {a.substanceName} ({a.severity})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Prescription Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescription.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.dmdProduct.name}</TableCell>
                  <TableCell>{item.dose}</TableCell>
                  <TableCell>{item.route}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>
                    {item.dmdProduct.cdSchedule !== "NON_CD" && (
                      <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 mr-1">
                        <Shield className="w-3 h-3 mr-1" />
                        CD
                      </Badge>
                    )}
                    {item.dmdProduct.highAlert && (
                      <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                        High Alert
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prescriber info */}
      <div className="text-sm text-muted-foreground">
        Prescribed by {prescription.prescriber.name}
        {prescription.prescriber.gmcNumber && ` (GMC: ${prescription.prescriber.gmcNumber})`}
        {" · "}
        {format(new Date(prescription.prescribedAt), "dd/MM/yyyy HH:mm")}
        {prescription.indication && ` · Indication: ${prescription.indication}`}
      </div>

      {/* Pharmacist notes */}
      <div className="space-y-1">
        <Label>Pharmacist notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any notes for the ward team…"
        />
      </div>

      {/* Reject form */}
      {showReject && (
        <Card className="border-red-200">
          <CardContent className="p-4 space-y-2">
            <Label className="text-red-700">Rejection reason *</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              placeholder="Document reason for rejection…"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={rejecting}
                variant="destructive"
              >
                {rejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Reject"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowReject(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={approving}
          style={{ backgroundColor: "#009639", color: "white" }}
          className="flex-1"
        >
          {approving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve &amp; Verify
            </>
          )}
        </Button>
        {!showReject && (
          <Button
            variant="destructive"
            onClick={() => setShowReject(true)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        )}
      </div>
    </div>
  );
}
