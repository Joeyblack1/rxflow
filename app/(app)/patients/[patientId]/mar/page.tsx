"use client";

import { useState, useEffect, use } from "react";
import { generateDailyMAR } from "@/lib/actions/mar";
import { MARCell } from "@/components/mar/MARCell";
import { AdministrationModal } from "@/components/mar/AdministrationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Calendar } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { toast } from "sonner";

interface MAREntry {
  id: string;
  scheduledAt: string;
  outcome: string | null;
  prescriptionItem: {
    id: string;
    dose: string;
    frequency: string;
    dmdProduct: {
      name: string;
      cdSchedule: string;
    };
  };
}

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function MARPage({ params }: PageProps) {
  const { patientId } = use(params);
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{
    id: string;
    scheduledAt: Date;
    dmdProductName: string;
    dose: string;
    isCD: boolean;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadMAR();
  }, [date]);

  async function loadMAR() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/patients/${patientId}/mar?date=${date.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateDailyMAR(patientId, date);
      toast.success(`Generated ${result.created} MAR entries`);
      loadMAR();
    } finally {
      setGenerating(false);
    }
  }

  // Group entries by drug
  const grouped: Record<
    string,
    { productName: string; isCD: boolean; dose: string; entries: MAREntry[] }
  > = {};
  for (const entry of entries) {
    const key = entry.prescriptionItem.id;
    if (!grouped[key]) {
      grouped[key] = {
        productName: entry.prescriptionItem.dmdProduct.name,
        isCD: entry.prescriptionItem.dmdProduct.cdSchedule !== "NON_CD",
        dose: entry.prescriptionItem.dose,
        entries: [],
      };
    }
    grouped[key].entries.push(entry);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Medicines Administration Record
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date.toISOString().split("T")[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          />
          <Button variant="outline" size="sm" onClick={loadMAR}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Generate MAR"
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {format(date, "EEEE d MMMM yyyy")}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {[
          { colour: "bg-green-500", label: "Given (G)" },
          { colour: "bg-orange-400", label: "Withheld (W)" },
          { colour: "bg-red-500", label: "Omitted (O)" },
          { colour: "bg-blue-400", label: "Refused (R)" },
          { colour: "bg-red-100 border border-red-200", label: "Overdue" },
          { colour: "bg-yellow-100 border border-yellow-200", label: "Due" },
          { colour: "bg-gray-100 border", label: "Not yet due" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${item.colour}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading MAR…
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No MAR entries for this date.</p>
              <p className="text-sm mt-1">
                Click &quot;Generate MAR&quot; to create entries from active prescriptions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium w-48">Drug</th>
                    <th className="text-left p-3 font-medium w-24">Dose</th>
                    <th className="text-left p-3 font-medium">Administration times</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(grouped).map((group, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="font-medium">{group.productName}</div>
                        {group.isCD && (
                          <Badge className="text-xs mt-0.5 bg-purple-100 text-purple-800 border-purple-200">
                            CD
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{group.dose}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {group.entries
                            .sort(
                              (a, b) =>
                                new Date(a.scheduledAt).getTime() -
                                new Date(b.scheduledAt).getTime()
                            )
                            .map((entry) => (
                              <div key={entry.id} className="flex flex-col items-center">
                                <span className="text-xs text-muted-foreground mb-1">
                                  {format(new Date(entry.scheduledAt), "HH:mm")}
                                </span>
                                <MARCell
                                  outcome={entry.outcome as any}
                                  scheduledAt={new Date(entry.scheduledAt)}
                                  onClick={() => {
                                    setSelectedEntry({
                                      id: entry.id,
                                      scheduledAt: new Date(entry.scheduledAt),
                                      dmdProductName: group.productName,
                                      dose: group.dose,
                                      isCD: group.isCD,
                                    });
                                    setModalOpen(true);
                                  }}
                                />
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdministrationModal
        entry={selectedEntry}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecorded={loadMAR}
      />
    </div>
  );
}
