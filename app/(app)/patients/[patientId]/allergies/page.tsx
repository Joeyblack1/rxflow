"use client";

import { useState, useEffect } from "react";
import { addAllergy, updateAllergyStatus } from "@/lib/actions/allergies";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

interface Allergy {
  id: string;
  substanceName: string;
  allergyType: string;
  severity: string;
  status: string;
  reactionType: string | null;
  notes: string | null;
  recordedAt: Date;
  onsetDate: Date | null;
}

interface PageProps {
  params: Promise<{ patientId: string }>;
}

const severityColour: Record<string, string> = {
  ANAPHYLAXIS: "bg-red-100 text-red-800 border-red-200",
  SEVERE: "bg-orange-100 text-orange-800 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  MILD: "bg-gray-100 text-gray-600 border-gray-200",
  UNKNOWN: "bg-gray-100 text-gray-600 border-gray-200",
};

function AddAllergyDialog({ patientId, onAdded }: { patientId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    substanceName: "",
    allergyType: "ALLERGY" as "ALLERGY" | "INTOLERANCE" | "SIDE_EFFECT",
    severity: "MODERATE" as "MILD" | "MODERATE" | "SEVERE" | "ANAPHYLAXIS" | "UNKNOWN",
    reactionType: "",
    notes: "",
    onsetDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addAllergy(patientId, {
        substanceName: form.substanceName,
        allergyType: form.allergyType,
        severity: form.severity,
        reactionType: form.reactionType || undefined,
        notes: form.notes || undefined,
        onsetDate: form.onsetDate || undefined,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Allergy recorded");
        setOpen(false);
        onAdded();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button style={{ backgroundColor: "#005EB8", color: "white" }} size="sm" />}>
        <Plus className="w-4 h-4 mr-1" />
        Add Allergy
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Allergy / Intolerance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Substance *</Label>
            <Input
              value={form.substanceName}
              onChange={(e) => setForm((f) => ({ ...f, substanceName: e.target.value }))}
              required
              placeholder="e.g. Penicillin, Sulfonamides"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={form.allergyType}
                onValueChange={(v) => { if (v) setForm((f) => ({ ...f, allergyType: v as typeof form.allergyType })); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALLERGY">Allergy</SelectItem>
                  <SelectItem value="INTOLERANCE">Intolerance</SelectItem>
                  <SelectItem value="SIDE_EFFECT">Side Effect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => { if (v) setForm((f) => ({ ...f, severity: v as typeof form.severity })); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANAPHYLAXIS">Anaphylaxis</SelectItem>
                  <SelectItem value="SEVERE">Severe</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="MILD">Mild</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Reaction type</Label>
            <Input
              value={form.reactionType}
              onChange={(e) => setForm((f) => ({ ...f, reactionType: e.target.value }))}
              placeholder="e.g. Rash, Anaphylaxis, Nausea"
            />
          </div>
          <div className="space-y-1">
            <Label>Onset date</Label>
            <Input
              type="date"
              value={form.onsetDate}
              onChange={(e) => setForm((f) => ({ ...f, onsetDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: "#005EB8", color: "white" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AllergiesPage({ params }: PageProps) {
  const [patientId, setPatientId] = useState<string>("");
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ patientId: pid }) => {
      setPatientId(pid);
      loadAllergies(pid);
    });
  }, []);

  async function loadAllergies(pid: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${pid}/allergies`);
      if (res.ok) {
        const data = await res.json();
        setAllergies(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(allergyId: string, status: "ACTIVE" | "INACTIVE" | "RESOLVED" | "ENTERED_IN_ERROR") {
    const result = await updateAllergyStatus(allergyId, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Allergy status updated");
      if (patientId) loadAllergies(patientId);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Allergies &amp; Intolerances
        </h2>
        {patientId && (
          <AddAllergyDialog
            patientId={patientId}
            onAdded={() => loadAllergies(patientId)}
          />
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {allergies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No allergies recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Substance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((allergy) => (
                  <TableRow key={allergy.id}>
                    <TableCell className="font-medium">{allergy.substanceName}</TableCell>
                    <TableCell>{allergy.allergyType}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${severityColour[allergy.severity]}`}>
                        {allergy.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{allergy.reactionType ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={allergy.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                        {allergy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(allergy.recordedAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {allergy.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => handleStatusUpdate(allergy.id, "RESOLVED")}
                        >
                          Mark Resolved
                        </Button>
                      )}
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
