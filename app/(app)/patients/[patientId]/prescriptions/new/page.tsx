"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { createPrescription } from "@/lib/actions/prescriptions";
import { DrugSearchInput } from "@/components/prescriptions/DrugSearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DMDProduct {
  id: string;
  vmpId: string;
  vtmId: string | null;
  name: string;
  brandName: string | null;
  formulation: string | null;
  strengthText: string | null;
  cdSchedule: string;
  highAlert: boolean;
  blackTriangle: boolean;
}

interface PrescriptionItem {
  dmdProduct: DMDProduct;
  dose: string;
  route: string;
  frequency: string;
  frequencyText: string;
  adminTimes: string[];
  daysSupply: string;
  withFood: boolean;
}

interface Interaction {
  id: string;
  drug1VtmId: string;
  drug2VtmId: string;
  severity: string;
  effect: string;
  management: string | null;
}

const ROUTES = [
  "ORAL","SUBLINGUAL","BUCCAL","IM","IV","SC","TOPICAL","PATCH","INHALED","NASAL","RECTAL","OTHER"
];

const FREQUENCIES = [
  { value: "OD", label: "Once Daily (OD)" },
  { value: "BD", label: "Twice Daily (BD)" },
  { value: "TDS", label: "Three Times Daily (TDS)" },
  { value: "QDS", label: "Four Times Daily (QDS)" },
  { value: "OM", label: "Every Morning (OM)" },
  { value: "ON", label: "Every Night (ON)" },
  { value: "WEEKLY", label: "Once Weekly" },
  { value: "FORTNIGHTLY", label: "Fortnightly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "STAT", label: "Stat (one dose)" },
  { value: "PRN", label: "As Required (PRN)" },
  { value: "VARIABLE", label: "Variable" },
];

const steps = ["Drug Search", "Dose & Route", "Safety Check", "Review & Sign"];

export default function NewPrescriptionPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [selectedDrug, setSelectedDrug] = useState<DMDProduct | null>(null);

  // Step 2
  const [doseForm, setDoseForm] = useState({
    dose: "",
    route: "ORAL",
    frequency: "OD",
    frequencyText: "",
    adminTime: "",
    daysSupply: "",
    withFood: false,
  });

  // Step 3 - interactions
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  // All items in this prescription
  const [items, setItems] = useState<PrescriptionItem[]>([]);

  // Step 4
  const [rxForm, setRxForm] = useState({
    indication: "",
    clinicalNotes: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    prescriptionType: "REGULAR" as "REGULAR" | "ONCE_ONLY" | "AS_REQUIRED" | "SHORT_COURSE" | "DISCHARGE" | "OUTPATIENT",
  });

  function handleDrugSelect(drug: DMDProduct) {
    setSelectedDrug(drug);
    setDoseForm((f) => ({ ...f, dose: drug.strengthText ?? "" }));
  }

  function addItem() {
    if (!selectedDrug) return;
    const item: PrescriptionItem = {
      dmdProduct: selectedDrug,
      dose: doseForm.dose,
      route: doseForm.route,
      frequency: doseForm.frequency,
      frequencyText: doseForm.frequencyText,
      adminTimes: doseForm.adminTime ? [doseForm.adminTime] : [],
      daysSupply: doseForm.daysSupply,
      withFood: doseForm.withFood,
    };
    setItems((prev) => [...prev, item]);
    setSelectedDrug(null);
    setDoseForm({ dose: "", route: "ORAL", frequency: "OD", frequencyText: "", adminTime: "", daysSupply: "", withFood: false });
  }

  async function checkInteractionsForItems(currentItems: PrescriptionItem[]) {
    const vtmIds = currentItems
      .map((i) => i.dmdProduct.vtmId)
      .filter(Boolean) as string[];
    if (vtmIds.length < 2) return;
    setCheckingInteractions(true);
    try {
      const res = await fetch("/api/medications/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vtmIds }),
      });
      const data = await res.json();
      setInteractions(data);
    } finally {
      setCheckingInteractions(false);
    }
  }

  function goToStep3() {
    const allItems = selectedDrug
      ? [...items, { dmdProduct: selectedDrug, dose: doseForm.dose, route: doseForm.route, frequency: doseForm.frequency, frequencyText: doseForm.frequencyText, adminTimes: doseForm.adminTime ? [doseForm.adminTime] : [], daysSupply: doseForm.daysSupply, withFood: doseForm.withFood }]
      : items;
    if (allItems.length === 0) {
      setError("Please add at least one drug");
      return;
    }
    if (selectedDrug) addItem();
    checkInteractionsForItems(allItems);
    setStep(2);
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError("No prescription items");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createPrescription(patientId, {
        prescriptionType: rxForm.prescriptionType,
        startDate: rxForm.startDate,
        endDate: rxForm.endDate || undefined,
        indication: rxForm.indication || undefined,
        clinicalNotes: rxForm.clinicalNotes || undefined,
        cdSchedule: items.some((i) => i.dmdProduct.cdSchedule !== "NON_CD")
          ? (items.find((i) => i.dmdProduct.cdSchedule !== "NON_CD")!.dmdProduct.cdSchedule as any)
          : "NON_CD",
        items: items.map((item) => ({
          dmdProductId: item.dmdProduct.id,
          dose: item.dose,
          route: item.route as any,
          frequency: item.frequency as any,
          frequencyText: item.frequencyText || undefined,
          adminTimes: item.adminTimes,
          daysSupply: item.daysSupply ? parseInt(item.daysSupply) : undefined,
          withFood: item.withFood,
        })),
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Prescription created — awaiting verification");
        router.push(`/patients/${patientId}/prescriptions`);
      }
    } finally {
      setLoading(false);
    }
  }

  const severityColour: Record<string, string> = {
    CONTRAINDICATED: "bg-red-100 text-red-800 border-red-200",
    SEVERE: "bg-orange-100 text-orange-800 border-orange-200",
    MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    MILD: "bg-gray-100 text-gray-600",
    INFORMATION: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/patients/${patientId}/prescriptions`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Prescription</h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                  ? "text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              style={i === step ? { backgroundColor: "#005EB8" } : {}}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-sm ${
                i === step ? "font-medium text-gray-900" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-200 mx-1" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Drug Search */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Drug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Drug search</Label>
              <DrugSearchInput onSelect={handleDrugSelect} />
            </div>

            {selectedDrug && (
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{selectedDrug.name}</p>
                    {selectedDrug.brandName && (
                      <p className="text-sm text-muted-foreground">
                        {selectedDrug.brandName}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {selectedDrug.cdSchedule !== "NON_CD" && (
                        <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                          <Shield className="w-3 h-3 mr-1" />
                          {selectedDrug.cdSchedule}
                        </Badge>
                      )}
                      {selectedDrug.highAlert && (
                        <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Alert
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedDrug(null)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Added drugs ({items.length}):
                </p>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded p-2 text-sm"
                  >
                    <span>
                      {item.dmdProduct.name} — {item.dose} {item.frequency}
                    </span>
                    <button onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {selectedDrug && (
                <Button variant="outline" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Drug
                </Button>
              )}
              <Button
                onClick={() => {
                  if (!selectedDrug && items.length === 0) {
                    setError("Please select a drug");
                    return;
                  }
                  setError("");
                  if (selectedDrug) addItem();
                  setStep(1);
                }}
                style={{ backgroundColor: "#005EB8", color: "white" }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Dose & Route */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Dose &amp; Route
              {items.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  — {items.map((i) => i.dmdProduct.name).join(", ")}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm">{item.dmdProduct.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Dose *</Label>
                    <Input
                      value={item.dose}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, dose: e.target.value } : it
                          )
                        )
                      }
                      placeholder="e.g. 10mg, 5ml"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Route *</Label>
                    <Select
                      value={item.route}
                      onValueChange={(v) => {
                        if (v) setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, route: v } : it
                          )
                        );
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROUTES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Frequency *</Label>
                    <Select
                      value={item.frequency}
                      onValueChange={(v) => {
                        if (v) setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, frequency: v } : it
                          )
                        );
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Administration time</Label>
                    <Input
                      type="time"
                      value={item.adminTimes[0] ?? ""}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, adminTimes: e.target.value ? [e.target.value] : [] } : it
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Days supply</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.daysSupply}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, daysSupply: e.target.value } : it
                          )
                        )
                      }
                      placeholder="28"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start date *</Label>
                  <Input
                    type="date"
                    value={rxForm.startDate}
                    onChange={(e) =>
                      setRxForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>End date (optional)</Label>
                  <Input
                    type="date"
                    value={rxForm.endDate}
                    onChange={(e) =>
                      setRxForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={goToStep3} style={{ backgroundColor: "#005EB8", color: "white" }}>
                Safety Check
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Safety Check */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Safety Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkingInteractions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking for drug interactions…
              </div>
            ) : interactions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Drug interactions detected
                </p>
                {interactions.map((ix) => (
                  <div
                    key={ix.id}
                    className={`p-3 rounded border text-sm ${severityColour[ix.severity] ?? "bg-gray-50"}`}
                  >
                    <div className="font-medium">
                      {ix.severity}: {ix.effect}
                    </div>
                    {ix.management && (
                      <div className="mt-1 text-xs opacity-80">
                        Management: {ix.management}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                No drug interactions detected
              </div>
            )}

            {items.some((i) => i.dmdProduct.cdSchedule !== "NON_CD") && (
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  This prescription contains a Controlled Drug (
                  {items
                    .filter((i) => i.dmdProduct.cdSchedule !== "NON_CD")
                    .map((i) => i.dmdProduct.name)
                    .join(", ")}
                  ). Additional documentation will be required.
                </AlertDescription>
              </Alert>
            )}

            {items.some((i) => i.dmdProduct.highAlert) && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  HIGH ALERT MEDICATION: Extra caution required. Please double-check dose and route.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} style={{ backgroundColor: "#005EB8", color: "white" }}>
                Review &amp; Sign
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Sign */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review &amp; Sign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg divide-y">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 text-sm">
                  <p className="font-semibold">{item.dmdProduct.name}</p>
                  <p className="text-muted-foreground">
                    {item.dose} · {item.route} · {item.frequency}
                    {item.daysSupply ? ` · ${item.daysSupply} days` : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={rxForm.startDate}
                  onChange={(e) =>
                    setRxForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Prescription type</Label>
                <Select
                  value={rxForm.prescriptionType}
                  onValueChange={(v) => { if (v) setRxForm((f) => ({ ...f, prescriptionType: v as any })); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="ONCE_ONLY">Once Only</SelectItem>
                    <SelectItem value="AS_REQUIRED">As Required</SelectItem>
                    <SelectItem value="SHORT_COURSE">Short Course</SelectItem>
                    <SelectItem value="DISCHARGE">Discharge</SelectItem>
                    <SelectItem value="OUTPATIENT">Outpatient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Indication</Label>
              <Input
                value={rxForm.indication}
                onChange={(e) =>
                  setRxForm((f) => ({ ...f, indication: e.target.value }))
                }
                placeholder="e.g. Schizophrenia, Bipolar disorder"
              />
            </div>

            <div className="space-y-1">
              <Label>Clinical notes</Label>
              <Textarea
                value={rxForm.clinicalNotes}
                onChange={(e) =>
                  setRxForm((f) => ({ ...f, clinicalNotes: e.target.value }))
                }
                rows={3}
                placeholder="Additional notes for pharmacist…"
              />
            </div>

            {interactions.length > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {interactions.length} drug interaction(s) noted. Prescriber
                  accepts clinical responsibility.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: "#005EB8", color: "white" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Sign Prescription
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
