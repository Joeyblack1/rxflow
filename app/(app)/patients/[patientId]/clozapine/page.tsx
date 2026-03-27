"use client";

import { useState, useEffect, use } from "react";
import { calculateClozapineResult } from "@/lib/clozapine";
import { ClozapineTrafficLightDisplay } from "@/components/clozapine/ClozapineTrafficLight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

interface MonitoringData {
  id: string;
  currentStatus: string;
  cpmsNumber: string | null;
  lastResultDate: string | null;
  results: Array<{
    id: string;
    resultDate: string;
    wbcCount: number;
    neutrophilCount: number;
    result: string;
    dispensingAuthorised: boolean;
    enteredBy: { name: string };
  }>;
}

const statusBadge: Record<string, string> = {
  GREEN: "bg-green-100 text-green-800",
  AMBER: "bg-yellow-100 text-yellow-800",
  RED: "bg-red-100 text-red-800",
  INCONCLUSIVE: "bg-gray-100 text-gray-700",
};

export default function ClozapinePage({ params }: PageProps) {
  const { patientId } = use(params);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ wbc: "", neutrophil: "", resultDate: new Date().toISOString().split("T")[0], notes: "" });

  useEffect(() => {
    loadMonitoring();
  }, []);

  async function loadMonitoring() {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/clozapine`);
      if (res.ok) {
        const data = await res.json();
        setMonitoring(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.wbc || !form.neutrophil) {
      toast.error("WBC and neutrophil count required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/clozapine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wbcCount: parseFloat(form.wbc),
          neutrophilCount: parseFloat(form.neutrophil),
          resultDate: form.resultDate,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        toast.success("Blood result recorded");
        setForm({ wbc: "", neutrophil: "", resultDate: new Date().toISOString().split("T")[0], notes: "" });
        loadMonitoring();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  const previewResult = form.wbc && form.neutrophil
    ? calculateClozapineResult(parseFloat(form.wbc), parseFloat(form.neutrophil))
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading clozapine monitoring…
      </div>
    );
  }

  if (!monitoring) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>No clozapine monitoring record found for this patient.</p>
      </div>
    );
  }

  const latestResult = monitoring.results[0];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FlaskConical className="w-5 h-5" />
        Clozapine Monitoring
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic light */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ClozapineTrafficLightDisplay
              status={monitoring.currentStatus as any}
              wbc={latestResult?.wbcCount}
              neutrophil={latestResult?.neutrophilCount}
              lastResultDate={
                monitoring.lastResultDate
                  ? new Date(monitoring.lastResultDate)
                  : null
              }
            />
            {monitoring.cpmsNumber && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                CPMS Number: {monitoring.cpmsNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Enter new result */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Enter New Blood Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>WBC (×10⁹/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.wbc}
                    onChange={(e) => setForm((f) => ({ ...f, wbc: e.target.value }))}
                    placeholder="e.g. 4.2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Neutrophils (×10⁹/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.neutrophil}
                    onChange={(e) => setForm((f) => ({ ...f, neutrophil: e.target.value }))}
                    placeholder="e.g. 2.5"
                  />
                </div>
              </div>

              {previewResult && (
                <div className={`p-2 rounded text-sm font-medium text-center ${statusBadge[previewResult]}`}>
                  Result: {previewResult}
                </div>
              )}

              <div className="space-y-1">
                <Label>Result date *</Label>
                <Input
                  type="date"
                  value={form.resultDate}
                  onChange={(e) => setForm((f) => ({ ...f, resultDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full"
                style={{ backgroundColor: "#005EB8", color: "white" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Result"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Blood Result History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {monitoring.results.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4">No results recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>WBC</TableHead>
                  <TableHead>Neutrophils</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Dispensing</TableHead>
                  <TableHead>Entered by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoring.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{format(new Date(r.resultDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{r.wbcCount.toFixed(1)}</TableCell>
                    <TableCell>{r.neutrophilCount.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusBadge[r.result]}`}>
                        {r.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          r.dispensingAuthorised
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.dispensingAuthorised ? "Authorised" : "Not Authorised"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.enteredBy.name}</TableCell>
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
